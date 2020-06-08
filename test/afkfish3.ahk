; i wrote this
; it's based off afkfish2.ahk

wintit = Minecraft 1.13 ; minecraft window name
SetTitleMatchMode 2
#SingleInstance Force

F12:: ; f12 key to toggle right click
rightclicking := !rightclicking
IfWinExist %wintit%
if (rightclicking) {
	ControlClick, , %wintit%, Right, , NAD
} else {
	ControlClick, , %wintit%, Right, , NAU
}
return
