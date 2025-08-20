--------------------------------------------------------------------------------
-- Company: FE
-- Engineer: A. Trost
--
-- Design Name: proc
-- Project Name: Red Pitaya V0.94 obdelava signalov
-- Target Device: Red Pitaya
-- Tool versions: Vivado 2020
-- Description: skaliranje signalov iz ASG
-- Sys Registers: 403_00050 ID; 00054 a
--------------------------------------------------------------------------------

library IEEE;
use IEEE.STD_LOGIC_1164.all;
use IEEE.NUMERIC_STD.all;

entity proc is
  port (
    clk_i   : in  std_logic;                      -- bus clock 
    rstn_i  : in  std_logic;                      -- bus reset - active low
    dat_a_i, dat_b_i  : in  std_logic_vector(13 downto 0);
	dat_a_o, dat_b_o  : out std_logic_vector(13 downto 0); -- output
	  
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
 signal state: std_logic_vector(7 downto 0);
 signal counter: unsigned(31 downto 0);
begin

-- divide by 16 (multiplication format 4.4), possible output overflow 
dat_a_o <= "00000000000000"; 
dat_b_o <= "00000000000000"; 

-- registers, write & control logic
pbus: process(clk_i)
begin 
 if rising_edge(clk_i) then
  if rstn_i = '0' then
   state <= x"00";
   counter <= X"00000001";
  else
   sys_ack <= sys_wen or sys_ren;    -- acknowledge transactions
   counter <= counter + 1;
   
   if sys_wen='1' then               -- decode address & write registers
	if sys_addr(19 downto 0)=X"00054" then
		state <= sys_wdata(7 downto 0);  -- 8-bit amplitude
    end if;    
   end if;    
   
   -- 122.88 MHz * 0.1s = 12288000 cycles
   if counter = 12288000 then
    state <= (not state(0)) & state(7 downto 1);
    counter <= X"00000001";
   end if;
  end if;   
 end if;
end process;

sys_err <= '0';

-- decode address & read data
with sys_addr(19 downto 0) select
   sys_rdata <= X"CABBA6E5" when x"00050",   -- ID
                X"000000" & state when x"54",
                std_logic_vector(counter) when x"58",
                X"04200690" when others;

led_out <= state;

end Behavioral;