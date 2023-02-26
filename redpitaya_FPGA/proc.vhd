-- scp project/redpitaya.runs/impl_1/red_pitaya_top.tcl .bit root@169.254.128.192:~/
-- cat red_pitaya_top.bit > /dev/xdevcfg

-- +0x50 cafe food (ID)
-- +0x54 Morse unit period
-- +0x58 pulse period
-- +0x5c pattern length
-- +0x60..0x80 pattern
-- +0x80 sample period
-- +0x84 threshold
-- +0x88 showing Morse code output or received IR
-- +0x8c the position of the cursor in the 256 bits of received samples (lowest byte)
--       number of loops the cursor has made (second lowest byte)
-- +0x90..0xa0 received samples

--------------------------------------------------------------------------------
-- Company: FE
-- Engineer: A. Trost
--
-- Design Name: proc
-- Project Name: Red Pitaya V0.94
-- Target Device: Red Pitaya
-- Tool versions: Vivado 2020.1
-- Description: Morse demo code
-- Sys Registers: NO
--------------------------------------------------------------------------------

library IEEE;
use IEEE.STD_LOGIC_1164.all;
use IEEE.NUMERIC_STD.all;

entity proc is
  port (
    clk_i   : in  std_logic;                      -- bus clock
    rstn_i  : in  std_logic;                      -- bus reset - active low
    dat_a_i, dat_b_i  : in  std_logic_vector(13 downto 0); -- input (IN1 and IN2)
	dat_a_o, dat_b_o  : out std_logic_vector(13 downto 0); -- output (OUT1 and OUT2)

    sys_addr  : in  std_logic_vector(31 downto 0);  -- bus address
    sys_wdata : in  std_logic_vector(31 downto 0);  -- bus write data
    sys_wen   : in  std_logic;                      -- bus write enable
    sys_ren   : in  std_logic;                      -- bus read enable
    sys_rdata : out std_logic_vector(31 downto 0);  -- bus read data
    sys_err   : out std_logic;                      -- bus error indicator
    sys_ack   : out std_logic;                      -- bus acknowledge signal
    led_out   : out std_logic_vector(7 downto 0)
    );
end proc;

architecture Behavioral of proc is

  -- LED output, write +0x88
  signal showOutput: std_logic;
    -- helper for wrapping around. it should be 7 + 7 = 14 bits
  signal trailing: std_logic_vector(13 downto 0);

  -- TRANSMIT
   -- settings
    -- Write +0x54
  signal unitPeriod: unsigned(31 downto 0); -- in cycles. A dit is two units
    -- Write +0x58
  signal pulsePeriod: unsigned(31 downto 0); -- in cycles.
    -- Write +0x60 .. 0x80 (exclusive)
  signal pattern: std_logic_vector(255 downto 0); -- units, 1 - on, 0 - off (hello world is 116 units)
    -- Write +0x5c
  signal patternLength: unsigned(7 downto 0); -- length 0 = 256

  -- state
  signal unitCounter: unsigned(31 downto 0);
  signal pulseCounter: unsigned(31 downto 0);
  signal step: unsigned(7 downto 0);

  -- for output
  signal morsing: std_logic;
  signal pulsing: std_logic;

  -- ACQUIRE AMOGN US
     -- Write +0x80
  signal samplePeriod: unsigned(31 downto 0); -- in cycles
     -- Write +0x84
  signal threshold: signed(13 downto 0); -- whether dat_a_i is high enough to be ON

  -- state
  signal sampleCounter: unsigned(31 downto 0);
  signal highEnough: std_logic;
    -- Read +0x8c
  signal recordStep: unsigned(7 downto 0);
    -- Read +0xac
  signal recordCount: unsigned(7 downto 0);
    -- Read +0x90 .. 0xa0 (exclusive)
  signal recording: std_logic_vector(255 downto 0);


begin

    highEnough <= '1' when signed(dat_a_i) > threshold else '0';

    -- registers, write & control logic
    main: process(clk_i)
    begin
        if rising_edge(clk_i) then

            if rstn_i = '0' then                    -- !!!!! Recalculate cperiod and dperiod for generating 57.6 kHz !!!!
                unitPeriod <= to_unsigned(12288000, 32); -- 0.1s period by default
                pulsePeriod <= to_unsigned(877714, 32); -- 1/14 of unitPeriod
                pattern <= (255 downto 28 => '0') & "1010100011101110111000101010"; -- SOS (34 units, including word break)
                patternLength <= to_unsigned(34, 8);
                unitCounter <= to_unsigned(0, 32);
                pulseCounter <= to_unsigned(0, 32);
                step <= to_unsigned(0, 8);
                pulsing <= '1';

                samplePeriod <= to_unsigned(2133, 32); -- 57.6 kHz samples by default
                threshold <= to_signed(1200, 14); -- 3V of 20V by default (from the starter code)
                recordStep <= to_unsigned(0, 8);
                recordCount <= to_unsigned(0, 8);
                recording <= (others => '0');
                sampleCounter <= to_unsigned(0, 32);

                showOutput <= '1';
             else
                sys_ack <= sys_wen or sys_ren;      -- acknowledge transactions

                unitCounter <= unitCounter + 1;
                pulseCounter <= pulseCounter + 1;
                sampleCounter <= sampleCounter + 1;

                if unitCounter = unitPeriod then
                  unitCounter <= to_unsigned(0, 32);
                  step <= step + 1;
                  if step = patternLength then
                    step <= to_unsigned(0, 8);
                  end if;
                end if;
                if pulseCounter = pulsePeriod then
                  pulseCounter <= to_unsigned(0, 32);
                  pulsing <= not pulsing;
                end if;
                if sampleCounter = samplePeriod then
                  sampleCounter <= to_unsigned(0, 32);
                  recording(to_integer(recordStep)) <= highEnough;
                  recordStep <= recordStep + 1; -- should automatically wrap around to 0
                  if recordStep = X"00" then
                    recordCount <= recordCount + 1;
                  end if;
                end if;

                if sys_wen='1' then                 -- decode address & write registers
                    if sys_addr(19 downto 0)=X"00054" then
                        unitPeriod <= unsigned(sys_wdata);  -- 14-bit threshold
                        unitCounter <= to_unsigned(0, 32);
                    elsif sys_addr(19 downto 0)=X"00058" then
                        pulsePeriod <= unsigned(sys_wdata);  -- 16-bit tick period
                        pulseCounter <= to_unsigned(0, 32);
                        pulsing <= '1';
                    elsif sys_addr(19 downto 0)=X"0005C" then
                        patternLength <= unsigned(sys_wdata(7 downto 0));  -- 16-bit pulse/sample period
                    elsif sys_addr(19 downto 5)=X"000"&"011" then
                      pattern((to_integer(unsigned(sys_addr(4 downto 0))) * 8 + 31) downto (to_integer(unsigned(sys_addr(4 downto 0))) * 8)) <= sys_wdata;

                    elsif sys_addr(19 downto 0)=X"00080" then
                        samplePeriod <= unsigned(sys_wdata);
                        sampleCounter <= to_unsigned(0, 32);
                    elsif sys_addr(19 downto 0)=X"00084" then
                        threshold <= signed(sys_wdata(13 downto 0));

                    elsif sys_addr(19 downto 0)=X"00088" then
                        showOutput <= sys_wdata(0);
                    end if;
               end if;
            end if;


        end if;


    end process;


    morsing <= pattern(to_integer(step));
    -- generate output by modulating morse with pulses (either maximal possible positive value or 0)
    dat_a_o <= "01111111111111" when (morsing and pulsing)='1' else "00000000000000";   -- pulsed signal
    -- !!!!!! generate binary signal on output !!!!!!!!!
    dat_b_o <= "01111111111111" when morsing='1' else "00000000000000";               -- binary signal (not pulsed) - test

    -- last 7 bits + first 7 bits
    trailing <= pattern(6 downto 0) & pattern((to_integer(patternLength) - 1) downto (to_integer(patternLength) - 7))
    -- when showOutput='1'
      --  else recording(6 downto 0) & recording(255 downto 249)
      ;
    led_out <=
      pattern((to_integer(step) + 7) downto to_integer(step))
          when step + 7 < patternLength and showOutput='1'
      else trailing(((to_integer(step) - to_integer(patternLength)) + 14) downto ((to_integer(step) - to_integer(patternLength)) + 7))
         when showOutput='1'
      else
        X"FF" when highEnough='1' else X"00"
      --     recording((to_integer(recordStep) + 7) downto to_integer(recordStep))
      --     when recordStep < 249 -- 256 - 7
      -- else trailing((to_integer(recordStep) - 242) downto (to_integer(recordStep) - 249))
        ;

    sys_err <= '0';         -- ignore errors

    -- decode address & read data
--    begin
--        if sys_addr(19 downto 5)=X"000"&"011" then
--          sys_rdata <= pattern((to_integer(unsigned(sys_addr(4 downto 0))) + 31) downto to_integer(unsigned(sys_addr(4 downto 0))));
--      else
      with sys_addr(19 downto 0) select
       sys_rdata <= X"CAFEF00D" when x"00050",   -- ID + state
                    std_logic_vector(unitPeriod) when x"00054",        -- morse timing tick
                    std_logic_vector(pulsePeriod) when x"00058",        -- morse timing tick
                    X"000000" & std_logic_vector(patternLength) when x"0005C",        -- pulse/sample period
                    pattern(31 downto 0) when X"00060", -- yeah.
                    pattern(63 downto 32) when X"00064",
                    pattern(95 downto 64) when X"00068",
                    pattern(127 downto 96) when X"0006c",
                    pattern(159 downto 128) when X"00070",
                    pattern(191 downto 160) when X"00074",
                    pattern(223 downto 192) when X"00078",
                    pattern(255 downto 224) when X"0007c",

                    std_logic_vector(samplePeriod) when x"00080",        -- morse timing tick
                    std_logic_vector(resize(threshold, 32)) when x"00084",        -- morse timing tick
                    X"0000" & std_logic_vector(recordCount) & std_logic_vector(recordStep) when x"0008c",        -- morse timing tick
                    recording(31 downto 0) when X"00090",
                    recording(63 downto 32) when X"00094",
                    recording(95 downto 64) when X"00098",
                    recording(127 downto 96) when X"0009c",
                    recording(159 downto 128) when X"000a0",
                    recording(191 downto 160) when X"000a4",
                    recording(223 downto 192) when X"000a8",
                    recording(255 downto 224) when X"000ac",

                    X"000000" & "0000000" & showOutput when x"00088",        -- morse timing tick

                    X"04200690" when others;
                    -- You cannot read the pattern back because I dont know how (see attempts above)
--        end if;


end Behavioral;
