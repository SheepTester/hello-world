; i wrote this too based on afkfish2.ahk

; ctrl + alt + ...
; 1 - hold down right click
; 2 - hold down left click
; 3 - hold down shift
; 4 - hold down W key
; 5 - hold down S key

wintit = Minecraft ; minecraft app title
SetTitleMatchMode 2 ; window title only has to contain "Minecraft"
#SingleInstance Force

*!^5::
IfWinExist %wintit%
backwarding := !backwarding

if (backwarding) {
	ControlSend ahk_parent, {s down}, %wintit%
} else {
	ControlSend ahk_parent, {s up}, %wintit%
}
return

*!^4::
IfWinExist %wintit%
forwarding := !forwarding

if (forwarding) {
	; Send {w down}
	ControlSend ahk_parent, {w down}, %wintit%
} else {
	; Send {w up}
	ControlSend ahk_parent, {w up}, %wintit%
}
return

*!^3::
IfWinExist %wintit%
shifting := !shifting

if (shifting) {
	Send {Shift down}
	; ControlSend ahk_parent, {LShift down}, %wintit%
} else {
	Send {Shift up}
	; ControlSend ahk_parent, {LShift up}, %wintit%
}
return

*!^2::
IfWinExist %wintit%
automining := !automining

if (automining) {
		ControlClick, , %wintit%, ,Left, , NAD
} else {
	ControlClick, , %wintit%, ,Left, , NAU
	}
	return

*!^1::
IfWinExist %wintit%
afkfishing := !afkfishing

if (afkfishing) {
		ControlClick, , %wintit%, ,Right, , NAD
} else {
	ControlClick, , %wintit%, ,Right, , NAU
	}
	return
