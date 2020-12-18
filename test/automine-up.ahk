; based on afkfish4.ahk
; made 2020-12-18

wintit = Minecraft ; minecraft app title
SetTitleMatchMode 2 ; window title only has to contain "Minecraft"
#SingleInstance Force

; Time (ms) it takes to mine a column
MineSpeed := 3500
; Walking speed is 4.317 m/s (NOT sneaking)
; https://minecraft.gamepedia.com/Sprinting#Usage
; Time it takes to move a metre (in ms, while NOT sneaking)
; Subtracting a few ms because blocks are being skipped
MetreTime := 1000 / 4.317 - 20

IfWinExist %wintit%

; Begin left click
ControlClick, , %wintit%, ,Left, , NAD

; Zig-zags back and forth
Loop, 8 {
  Loop, 15 {
    Sleep, %MineSpeed%
    ; Hold down w briefly to walk forwards
    ControlSend ahk_parent, {w down}, %wintit%
    Sleep, %MetreTime%
    ControlSend ahk_parent, {w up}, %wintit%
  }
  Sleep, %MineSpeed%

  ; Hold down d briefly to walk right
  ControlSend ahk_parent, {d down}, %wintit%
  Sleep, %MetreTime%
  ControlSend ahk_parent, {d up}, %wintit%

  Loop, 15 {
    Sleep, %MineSpeed%
    ; Hold down s briefly to walk backwards
    ControlSend ahk_parent, {s down}, %wintit%
    Sleep, %MetreTime%
    ControlSend ahk_parent, {s up}, %wintit%
  }
  Sleep, %MineSpeed%

  ; Hold down d briefly to walk right
  ControlSend ahk_parent, {d down}, %wintit%
  Sleep, %MetreTime%
  ControlSend ahk_parent, {d up}, %wintit%
}

; Stop left click
ControlClick, , %wintit%, ,Left, , NAU

Exit
