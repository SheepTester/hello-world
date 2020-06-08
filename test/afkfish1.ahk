*F8:: ; <--- change to any key you want to activate the toggle
AfkToggle := !AfkToggle
If (AfkToggle)
{
ControlSend, ahk_parent, {g down}, Minecraft ; <-- change g to any key you wish to right click with
}
else
{
ControlSend, ahk_parent, {g up}, Minecraft ; <-- if you changed g remember to change it here as well
}
