wintit = Minecraft 1.13 ; Change according to name of game window for example Minecraft 1.13-pre2
SetTitleMatchMode 2
#SingleInstance Force

!^f:: ; Pressing ctrl + alt + f for will start fishing
IfWinExist %wintit%

BreakLoop = 0
	Loop
	{
		if (BreakLoop = 1)
		{
			BreakLoop = 0
			break
		}

		Sleep 100
		ControlClick, , %wintit%, ,Right, , NAD
		Sleep 500
		ControlClick, , %wintit%, ,Right, , NAU
		}
	Return

	!^p:: 	; Pressing ctrl + alt + p will stop it
	BreakLoop = 1
	return
