; based on automine-up.ahk
; made 2020-12-18

wintit = Minecraft ; minecraft app title
SetTitleMatchMode 2 ; window title only has to contain "Minecraft"
#SingleInstance Force

; Time (ms) it takes to mine a row
MineSpeed := 22500
; Sneaking speed is 1.31 m/s
; https://minecraft.gamepedia.com/Sneaking#Effects
; Time it takes to move a metre (in ms, while sneaking)
MetreTime := 1000 / 1.31
ReturnTime := MetreTime * 16 + 100

; Tip: aim slightly downwards at a rotation x of 12 degreesish.
; This aims slightly below the inset corner:
;    _
;  _|
; |

IfWinExist %wintit%

; Begin left click
ControlClick, , %wintit%, ,Left, , NAD

; Repeats indefinitely; exit the script as you please.
; Exiting means it won't stop left clicking, though!
loop {
  ; Mine forwards
  ControlSend ahk_parent, {w down}, %wintit%
  Sleep, %MineSpeed%
  ControlSend ahk_parent, {w up}, %wintit%

  ; Walk back
  ControlSend ahk_parent, {s down}, %wintit%
  Sleep, %ReturnTime%
  ControlSend ahk_parent, {s up}, %wintit%

  ; Walk right 1m
  ControlSend ahk_parent, {d down}, %wintit%
  Sleep, %MetreTime%
  ControlSend ahk_parent, {d up}, %wintit%
}
