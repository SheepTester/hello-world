; Title contains text
SetTitleMatchMode, 2


; this is fail oof





; ControlSend,ahk_parent,{SPACE},ahk_exe chrome.exe
; return

!j::
SetTitleMatchMode, 2

ControlGet, OutputVar, Hwnd,,Chrome_RenderWidgetHostHWND1, Google Chrome

ControlFocus,,ahk_id %outputvar%

; ControlSend, , {Space}, Google Chrome
ControlSend, , ^t, Google Chrome
Sleep, 100
ControlSend, , sheepte{Enter}, Google Chrome
return

return

Sleep, 1000

ControlGet, DiscordWindow, Hwnd, , Chrome_RenderWidgetHostHWND1, Google Chrome
ControlFocus, , ahk_id %DiscordWindow%

ControlSend, , ^T, Google Chrome
ControlSend, , sheepte, Google Chrome

return

; Sleep, 3000

WinWait Discord
WinActivate
ControlSend, , ^K
Sleep, 500
ControlSend, , sean{Enter}
Sleep, 100
ControlSend, , testing autohotkey{Enter}

return

; works???
ControlGet, OutputVar, Hwnd,,Chrome_RenderWidgetHostHWND1, Google Chrome

ControlFocus,,ahk_id %outputvar%


ControlSend, , {Space} , Google Chrome


; ---- workn't ---
return

ControlSend,,{SPACE},ahk_exe chrome.exe

return

WinName = Grooveshark ahk_class Chrome_WidgetWin_0
WinClass = Chrome_RenderWidgetHostHWND1

ControlSend, %WinClass%, {Space}, %WinName%

return

WinWait Notepad

; First argument `Control` can be empty
ControlSend, , ^V
ControlSend, , hmm{Enter}


