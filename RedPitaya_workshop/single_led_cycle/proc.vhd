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
 signal counter: unsigned(7 downto 0) := x"00";
 signal reg: std_logic_vector(7 downto 0) := x"00";
begin

dat_a_o <= x"00" & reg(5 downto 0);
dat_b_o <= x"00" & reg(5 downto 0);

main: process(clk_i)
begin
 if rising_edge(clk_i) then
  if rstn_i = '0' then
   reg <= x"01";
   counter <= x"00";
  else
   sys_ack <= sys_wen or sys_ren;
   counter <= counter + x"01";
   if counter=x"00" then
    reg <= reg(0) & reg(7 downto 1);
   end if;
  end if;
 end if;
end process;

sys_err <= '0';
led_out <= reg;
sys_rdata <= X"00000000";

end Behavioral;
