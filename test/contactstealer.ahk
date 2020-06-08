; i wrote this too based on afkfish2.ahk

; ctrl + alt + ...
; 2 - stop
; 3 - click every once in a while



!^3::
Loop, 400
{
	MouseClick, left
	Sleep, 1000
	if stopLooping = 1
	{
		stopLooping = 0
		break
	}
}
return

!^2::
stopLooping = 1
return
