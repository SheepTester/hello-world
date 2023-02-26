--------------------------------------------------------------------------------
-- Company: FE
-- Engineer: A. Trost
--
-- Design Name: proc
-- Project Name: Red Pitaya V0.94
-- Target Device: Red Pitaya
-- Tool versions: Vivado 2020.1
-- Description: Morse demo code
-- Sys Registers: 403_00050 ID & start; 00054 threshold; 00058 morse tick
--                    0005C pulse/sample; 00060 sampled data
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

  -- signal samplePeriod: unsigned(31 downto 0); -- in cycles
  -- signal threshold: signed(13 downto 0); -- whether dat_a_i is high enough to be ON

begin



    -- registers, write & control logic
    main: process(clk_i)
    begin
        if rising_edge(clk_i) then

            if rstn_i = '0' then                    -- !!!!! Recalculate cperiod and dperiod for generating 57.6 kHz !!!!
                unitPeriod <= to_unsigned(12288000, 32); -- 0.1s period by default
                pulsePeriod <= to_unsigned(1755428, 32); -- a seventh of unitPeriod
                pattern <= (255 downto 28 => '0') & "1010100011101110111000101010"; -- SOS (34 units, including word break)
                patternLength <= to_unsigned(34, 8);
                unitCounter <= to_unsigned(0, 32);
                pulseCounter <= to_unsigned(0, 32);
                step <= to_unsigned(0, 8);
                pulsing <= '0';
             else
                sys_ack <= sys_wen or sys_ren;      -- acknowledge transactions

                unitCounter <= unitCounter + 1;
                pulseCounter <= pulseCounter + 1;

                if unitCounter = unitPeriod then
                  unitCounter <= to_unsigned(0, 32);
                  step <= step + 1;
                end if;
                if pulseCounter = pulsePeriod then
                  pulseCounter <= to_unsigned(0, 32);
                  pulsing <= not pulsing;
                end if;
                if step = patternLength then
                  step <= to_unsigned(0, 8);
                end if;

                if sys_wen='1' then                 -- decode address & write registers
                    if sys_addr(19 downto 0)=X"00054" then
                        unitPeriod <= unsigned(sys_wdata);  -- 14-bit threshold
                    elsif sys_addr(19 downto 0)=X"00058" then
                        pulsePeriod <= unsigned(sys_wdata);  -- 16-bit tick period
                    elsif sys_addr(19 downto 0)=X"0005C" then
                        patternLength <= unsigned(sys_wdata(7 downto 0));  -- 16-bit pulse/sample period
                    elsif sys_addr(19 downto 5)=X"000"&"011" then
                      pattern((to_integer(unsigned(sys_addr(4 downto 0))) + 31) downto to_integer(unsigned(sys_addr(4 downto 0)))) <= sys_wdata;
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

    led_out <= pattern((to_integer(step) + 7) downto to_integer(step));

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
                    X"04200690" when others;
                    -- You cannot read the pattern back because I dont know how (see attempts above)
--        end if;


end Behavioral;
