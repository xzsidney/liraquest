;-| Button Remapping |-----------------------------------------------------
; This section lets you remap the player's buttons (to easily change the
; button configuration). The format is:
;   old_button = new_button
; If new_button is left blank, the button cannot be pressed.
[Remap]
x = x
y = y
z = z
a = a
b = b
c = c
s = s

;-| Default Values |-------------------------------------------------------
[Defaults]
; Default value for the "time" parameter of a Command. Minimum 1.
command.time = 15

; Default value for the "buffer.time" parameter of a Command. Minimum 1,
; maximum 30.
command.buffer.time = 1

;-| Super Motions |--------------------------------------------------------

[Command] ; Maximum Spider! - Original config
name = "max_spider"
command = ~D, DF, F, x+y+z

[Command]
name = "max_spider"
command = ~D, DF, F, x+y

[Command]
name = "max_spider"
command = ~D, DF, F, y+z

[Command] ; Crawler Assault!
name = "crawl_assault"
command = ~D, DF, F, a+b+c

[Command]
name = "crawl_assault"
command = ~D, DF, F, a+b

[Command]
name = "crawl_assault"
command = ~D, DF, F, b+c

[Command]
name = "ulti_web"
command = ~D, DB, B, x+y

[Command]
name = "ulti_web"
command = ~D, DB, B, y+z

[Command]
name = "oneforjj"
command = ~D, DB, B, a+b

[Command]
name = "oneforjj"
command = ~D, DB, B, c+b

;-| Special Motions |------------------------------------------------------

; FCB (Full circle back -- Webthrow!!)
[Command]
name = "FCB_x"
command = ~D, DB, B, x  ;(keyboard friendly :) )

[Command]
name = "FCB_x"
command = ~D, DB, B, y

[Command]
name = "FCB_x"
command = ~D, DB, B, z

;--------------------------------------
; Uppercut  (Spider Sting)
[Command]
name = "uppercut_x"
command = ~F, D, DF, x

[Command]
name = "uppercut_y"
command = ~F, D, DF, y

[Command]
name = "uppercut_z"
command = ~F, D, DF, z

;-------------------------------------

; QCF any punch (Web ball!)
[Command]
name = "QCF_x"
command = ~D, DF, F, x

[Command]
name = "QCF_y"
command = ~D, DF, F, y

[Command]
name = "QCF_z"
command = ~D, DF, F, z

; QCB any kick  (Web Swing!)
[Command]
name = "swing_a"
command = ~D, DB, B, a

[Command]
name = "swing_b"
command = ~D, DB, B, b

[Command]
name = "swing_c"
command = ~D, DB, B, c

;-| Double Tap |-----------------------------------------------------------
[Command]
name = "FF";Required (do not remove)
command = F, F
time = 12

[Command]
name = "BB";Required (do not remove)
command = B, B
time = 12

;-| 2/3 Button Combination |-----------------------------------------------
[Command]
name = "recovery";Required (do not remove)
command = a+b
time = 1

[Command]
name = "ab"
command = a+b
time = 1

;Black Cat stricker
[Command]
name = "yb"
command = y+b
time = 1

;-| Dir + Button |---------------------------------------------------------
[Command]
name = "Dashforward2"
command = /F,x+y+z
time = 1

[Command]
name = "Dashbackward2"
command = /B,x+y+z
time = 1

[Command]
name = "fwd_y"
command = /F,y
time = 1

[Command]
name = "fwd_z"
command = /F,z
time = 1

[Command]
name = "back_y"
command = /B,y
time = 1

[Command]
name = "back_z"
command = /B,z
time = 1


;-| Single Button |---------------------------------------------------------
[Command]
name = "a"
command = a
time = 1

[Command]
name = "b"
command = b
time = 1

[Command]
name = "c"
command = c
time = 1

[Command]
name = "x"
command = x
time = 1

[Command]
name = "y"
command = y
time = 1

[Command]
name = "z"
command = z
time = 1

[Command]
name = "s"
command = s
time = 1

;-| Double Button |---------------------------------------------------------

[Command]
name = "down_up"
command = $D, $U

;-| Triple Button |---------------------------------------------------------

[Command]
name = "3kicks"
command = a+b+c
time = 1

;-| Hold Dir |--------------------------------------------------------------
[Command]
name = "holdfwd";Required (do not remove)
command = /$F
time = 1

[Command]
name = "holdback";Required (do not remove)
command = /$B
time = 1

[Command]
name = "holdup";Required (do not remove)
command = /$U
time = 1

[Command]
name = "holddown";Required (do not remove)
command = /$D
time = 1


;---------------------------------------------------------------------------
; 2. State entry
; --------------
; Each state entry block looks like:
;   [State -1]                  ;Don't change this
;   type = ChangeState          ;Don't change this
;   value = new_state_number
;   trigger1 = command = "command_name"
;   . . .  (any additional triggers)
;
; - new_state_number is the number of the state to change to
; - command_name is the name of the command (from the section above)
; - Useful triggers to know:
;   - statetype
;       S, C or A : current state-type of player (stand, crouch, air)
;   - ctrl
;       0 or 1 : 1 if player has control. Unless "interrupting" another
;                move, you'll want ctrl = 1
;   - stateno
;       number of state player is in - useful for "move interrupts"
;   - movecontact
;       0 or 1 : 1 if player's last attack touched the opponent
;                useful for "move interrupts"
;
; Note: The order of state entry is important.
;   State entry with a certain command must come before another state
;   entry with a command that is the subset of the first.  
;   For example, command "fwd_a" must be listed before "a", and
;   "fwd_ab" should come before both of the others.
; Don't remove the following line. It's required by the CMD standard.
[Statedef -1]

;===========================================================================
;-------------------------------------------------------------
; Super/Hyper moves
;-------------------------------------------------------------
; Crawler Assault
[State -1]
type = ChangeState
value = 3000
triggerall = command = "crawl_assault"
triggerall = power >= 1000
triggerall = StateType != A
triggerall = MoveType != H
trigger1 = ctrl = 1
trigger2 = stateno = 412
trigger2 = movecontact
trigger2 = time > 4

; Maximum Spider
[State -1]
type = ChangeState
value = 3500
triggerall = command = "max_spider"
triggerall = power >= 1000
trigger1 = StateType = S
trigger1 = ctrl = 1
trigger2 = StateType = A
trigger2 = ctrl = 1

; Ultimate Web Throw
[State -1]
type = ChangeState
value = 3510
triggerall = command = "ulti_web"
triggerall = power >= 1000
trigger1 = StateType = S
trigger1 = ctrl = 1

; One for J.J.
[State -1]
type = ChangeState
value = 3600
triggerall = command = "oneforjj"
triggerall = power >= 1000
trigger1 = StateType = S
trigger1 = ctrl = 1

;-------------------------------------------------------------
; Secial moves
;-------------------------------------------------------------

; Spider Sting (Weak)
[State -1]
type = ChangeState
value = 1060
triggerall = command = "uppercut_x"
triggerall = StateType != A
triggerall = MoveType != H
trigger1 = ctrl = 1
trigger2 = stateno = 200
trigger2 = movecontact
trigger3 = stateno = 201
trigger3 = movecontact
trigger4 = stateno = 202
trigger4 = movecontact
trigger5 = stateno = 210
trigger5 = movecontact
trigger6 = stateno = 211
trigger6 = movecontact
trigger7 = stateno = 212
trigger7 = movecontact
trigger8 = stateno = 400
trigger8 = movecontact
trigger9 = stateno = 401
trigger9 = movecontact
trigger10 = stateno = 402
trigger10 = movecontact
trigger11 = stateno = 410
trigger11 = movecontact
trigger12 = stateno = 411
trigger12 = movecontact
trigger13 = stateno = 412
trigger13 = movecontact

; Spider Sting (Medium)
[State -1]
type = ChangeState
value = 1070
triggerall = command = "uppercut_y"
triggerall = StateType != A
triggerall = MoveType != H
trigger1 = ctrl = 1
trigger2 = stateno = 200
trigger2 = movecontact
trigger3 = stateno = 201
trigger3 = movecontact
trigger4 = stateno = 202
trigger4 = movecontact
trigger5 = stateno = 210
trigger5 = movecontact
trigger6 = stateno = 211
trigger6 = movecontact
trigger7 = stateno = 212
trigger7 = movecontact
trigger8 = stateno = 400
trigger8 = movecontact
trigger9 = stateno = 401
trigger9 = movecontact
trigger10 = stateno = 402
trigger10 = movecontact
trigger11 = stateno = 410
trigger11 = movecontact
trigger12 = stateno = 411
trigger12 = movecontact
trigger13 = stateno = 412
trigger13 = movecontact

; Spider Sting (Fierce)
[State -1]
type = ChangeState
value = 1080
triggerall = command = "uppercut_z"
triggerall = StateType != A
triggerall = MoveType != H
trigger1 = ctrl = 1
trigger2 = stateno = 200
trigger2 = movecontact
trigger3 = stateno = 201
trigger3 = movecontact
trigger4 = stateno = 202
trigger4 = movecontact
trigger5 = stateno = 210
trigger5 = movecontact
trigger6 = stateno = 211
trigger6 = movecontact
trigger7 = stateno = 212
trigger7 = movecontact
trigger8 = stateno = 400
trigger8 = movecontact
trigger9 = stateno = 401
trigger9 = movecontact
trigger10 = stateno = 402
trigger10 = movecontact
trigger11 = stateno = 410
trigger11 = movecontact
trigger12 = stateno = 411
trigger12 = movecontact
trigger13 = stateno = 412
trigger13 = movecontact

;---------------------------------------------------------------------------
; Web Ball (Weak)
[State -1]
type = ChangeState
value = 1000
triggerall = command = "QCF_x"
triggerall = StateType != A
triggerall = MoveType != H
triggerall = NumProjID(1001) = 0
triggerall = NumProjID(1010) = 0
triggerall = NumProjID(1020) = 0
triggerall = NumProjID(1030) = 0
triggerall = NumProjID(1040) = 0
triggerall = NumProjID(1050) = 0
trigger1 = ctrl = 1
trigger2 = stateno = 200
trigger2 = movecontact
trigger3 = stateno = 201
trigger3 = movecontact
trigger4 = stateno = 202
trigger4 = time > 7
trigger5 = stateno = 210
trigger5 = movecontact
trigger6 = stateno = 211
trigger6 = movecontact
trigger7 = stateno = 212
trigger7 = movecontact
trigger8 = stateno = 400
trigger8 = movecontact
trigger9 = stateno = 401
trigger9 = movecontact
trigger10 = stateno = 402
trigger10 = time < 10
trigger11 = stateno = 410
trigger11 = movecontact
trigger12 = stateno = 411
trigger12 = movecontact
trigger13 = stateno = 412
trigger13 = movecontact
trigger14 = stateno = 402
trigger14 = movecontact

; Web Ball (Medium)
[State -1]
type = ChangeState
value = 1010
triggerall = command = "QCF_y"
triggerall = StateType != A
triggerall = MoveType != H
triggerall = NumProjID(1001) = 0
triggerall = NumProjID(1010) = 0
triggerall = NumProjID(1020) = 0
triggerall = NumProjID(1030) = 0
triggerall = NumProjID(1040) = 0
triggerall = NumProjID(1050) = 0
trigger1 = ctrl = 1
trigger2 = stateno = 200
trigger2 = movecontact
trigger3 = stateno = 201
trigger3 = movecontact
trigger4 = stateno = 202
trigger4 = time > 7
trigger5 = stateno = 210
trigger5 = movecontact
trigger6 = stateno = 211
trigger6 = movecontact
trigger7 = stateno = 212
trigger7 = movecontact
trigger8 = stateno = 400
trigger8 = movecontact
trigger9 = stateno = 401
trigger9 = movecontact
trigger10 = stateno = 402
trigger10 = time < 10
trigger11 = stateno = 410
trigger11 = movecontact
trigger12 = stateno = 411
trigger12 = movecontact
trigger13 = stateno = 412
trigger13 = movecontact
trigger14 = stateno = 402
trigger14 = movecontact

; Web Ball (Fierce)
[State -1]
type = ChangeState
value = 1020
triggerall = command = "QCF_z"
triggerall = StateType != A
triggerall = MoveType != H
triggerall = NumProjID(1001) = 0
triggerall = NumProjID(1010) = 0
triggerall = NumProjID(1020) = 0
triggerall = NumProjID(1030) = 0
triggerall = NumProjID(1040) = 0
triggerall = NumProjID(1050) = 0
trigger1 = ctrl = 1
trigger2 = stateno = 200
trigger2 = movecontact
trigger3 = stateno = 201
trigger3 = movecontact
trigger4 = stateno = 202
trigger4 = time > 8
trigger5 = stateno = 210
trigger5 = movecontact
trigger6 = stateno = 211
trigger6 = movecontact
trigger7 = stateno = 212
trigger7 = movecontact
trigger8 = stateno = 400
trigger8 = movecontact
trigger9 = stateno = 401
trigger9 = movecontact
trigger10 = stateno = 402
trigger10 = time < 10
trigger11 = stateno = 410
trigger11 = movecontact
trigger12 = stateno = 411
trigger12 = movecontact
trigger13 = stateno = 412
trigger13 = movecontact
trigger14 = stateno = 402
trigger14 = movecontact

; Air Web Ball (Weak)
[State -1]
type = ChangeState
value = 1030
triggerall = command = "QCF_x"
triggerall = StateType = A
triggerall = MoveType != H
triggerall = NumProjID(1001) = 0
triggerall = NumProjID(1010) = 0
triggerall = NumProjID(1020) = 0
triggerall = NumProjID(1030) = 0
triggerall = NumProjID(1040) = 0
triggerall = NumProjID(1050) = 0
trigger1 = ctrl = 1
trigger2 = stateno = 600
trigger2 = movecontact
trigger3 = stateno = 601
trigger3 = movecontact
trigger4 = stateno = 602
trigger4 = movecontact
trigger5 = stateno = 610
trigger5 = movecontact
trigger6 = stateno = 611
trigger6 = movecontact
trigger7 = stateno = 612
trigger7 = movecontact
trigger8 = stateno = 631
trigger8 = movehit
trigger9 = stateno = 750

; Air Web Ball (Medium)
[State -1]
type = ChangeState
value = 1040
triggerall = command = "QCF_y"
triggerall = StateType = A
triggerall = MoveType != H
triggerall = NumProjID(1001) = 0
triggerall = NumProjID(1010) = 0
triggerall = NumProjID(1020) = 0
triggerall = NumProjID(1030) = 0
triggerall = NumProjID(1040) = 0
triggerall = NumProjID(1050) = 0
trigger1 = ctrl = 1
trigger2 = stateno = 600
trigger2 = movecontact
trigger3 = stateno = 601
trigger3 = movecontact
trigger4 = stateno = 602
trigger4 = movecontact
trigger5 = stateno = 610
trigger5 = movecontact
trigger6 = stateno = 611
trigger6 = movecontact
trigger7 = stateno = 612
trigger7 = movecontact
trigger8 = stateno = 631
trigger8 = movehit
trigger9 = stateno = 750

; Air Web Ball (Fierce)
[State -1]
type = ChangeState
value = 1050
triggerall = command = "QCF_z"
triggerall = StateType = A
triggerall = MoveType != H
triggerall = NumProjID(1001) = 0
triggerall = NumProjID(1010) = 0
triggerall = NumProjID(1020) = 0
triggerall = NumProjID(1030) = 0
triggerall = NumProjID(1040) = 0
triggerall = NumProjID(1050) = 0
trigger1 = ctrl = 1
trigger2 = stateno = 600
trigger2 = movecontact
trigger3 = stateno = 601
trigger3 = movecontact
trigger4 = stateno = 602
trigger4 = movecontact
trigger5 = stateno = 610
trigger5 = movecontact
trigger6 = stateno = 611
trigger6 = movecontact
trigger7 = stateno = 612
trigger7 = movecontact
trigger8 = stateno = 631
trigger8 = movehit
trigger9 = stateno = 750

;---------------------------------------------------------------------------
; Web Swing (weak)
[State -1]
type = ChangeState
value = 1100
triggerall = command = "swing_a"
triggerall = MoveType != H
trigger1 = ctrl = 1
trigger2 = stateno = 200
trigger2 = movecontact
trigger3 = stateno = 201
trigger3 = movecontact
trigger4 = stateno = 202
trigger4 = movecontact
trigger5 = stateno = 210
trigger5 = movecontact
trigger6 = stateno = 211
trigger6 = movecontact
trigger7 = stateno = 212
trigger7 = movecontact
trigger8 = stateno = 400
trigger8 = movecontact
trigger9 = stateno = 401
trigger9 = movecontact
trigger10 = stateno = 402
trigger10 = time < 10
trigger11 = stateno = 410
trigger11 = movecontact
trigger12 = stateno = 411
trigger12 = movecontact
trigger13 = stateno = 412
trigger13 = movecontact
trigger14 = stateno = 402
trigger14 = movecontact
trigger15 = stateno = 600
trigger15 = movecontact
trigger16 = stateno = 601
trigger16 = movecontact
trigger17 = stateno = 602
trigger17 = movecontact
trigger18 = stateno = 610
trigger18 = movecontact
trigger19 = stateno = 611
trigger19 = movecontact
trigger20 = stateno = 612
trigger20 = movecontact
trigger21 = stateno = 631
trigger21 = movehit

; Web Swing (Medium)
[State -1]
type = ChangeState
value = 1110
triggerall = command = "swing_b"
triggerall = MoveType != H
trigger1 = ctrl = 1
trigger2 = stateno = 200
trigger2 = movecontact
trigger3 = stateno = 201
trigger3 = movecontact
trigger4 = stateno = 202
trigger4 = movecontact
trigger5 = stateno = 210
trigger5 = movecontact
trigger6 = stateno = 211
trigger6 = movecontact
trigger7 = stateno = 212
trigger7 = movecontact
trigger8 = stateno = 400
trigger8 = movecontact
trigger9 = stateno = 401
trigger9 = movecontact
trigger10 = stateno = 402
trigger10 = time < 10
trigger11 = stateno = 410
trigger11 = movecontact
trigger12 = stateno = 411
trigger12 = movecontact
trigger13 = stateno = 412
trigger13 = movecontact
trigger14 = stateno = 402
trigger14 = movecontact
trigger15 = stateno = 600
trigger15 = movecontact
trigger16 = stateno = 601
trigger16 = movecontact
trigger17 = stateno = 602
trigger17 = movecontact
trigger18 = stateno = 610
trigger18 = movecontact
trigger19 = stateno = 611
trigger19 = movecontact
trigger20 = stateno = 612
trigger20 = movecontact
trigger21 = stateno = 631
trigger21 = movehit

; Web Swing (Fierce)
[State -1]
type = ChangeState
value = 1120
triggerall = command = "swing_c"
triggerall = MoveType != H
trigger1 = ctrl = 1
trigger2 = stateno = 200
trigger2 = movecontact
trigger3 = stateno = 201
trigger3 = movecontact
trigger4 = stateno = 202
trigger4 = movecontact
trigger5 = stateno = 210
trigger5 = movecontact
trigger6 = stateno = 211
trigger6 = movecontact
trigger7 = stateno = 212
trigger7 = movecontact
trigger8 = stateno = 400
trigger8 = movecontact
trigger9 = stateno = 401
trigger9 = movecontact
trigger10 = stateno = 402
trigger10 = time < 10
trigger11 = stateno = 410
trigger11 = movecontact
trigger12 = stateno = 411
trigger12 = movecontact
trigger13 = stateno = 412
trigger13 = movecontact
trigger14 = stateno = 402
trigger14 = movecontact
trigger15 = stateno = 600
trigger15 = movecontact
trigger16 = stateno = 601
trigger16 = movecontact
trigger17 = stateno = 602
trigger17 = movecontact
trigger18 = stateno = 610
trigger18 = movecontact
trigger19 = stateno = 611
trigger19 = movecontact
trigger20 = stateno = 612
trigger20 = movecontact
trigger21 = stateno = 631
trigger21 = movehit

;------------------------------
; Web throw 
;-------------------------------
[State -1]
type = ChangeState
value = 4000
triggerall = command = "FCB_x"
trigger1 = statetype = S
trigger1 = ctrl = 1
trigger2 = statetype = C
trigger2 = ctrl = 1
;trigger3 = statetype = A
;trigger3 = ctrl = 1

;---------------------------------------------------------------------------
;RunFwd
[State -1]
type = ChangeState
value = 100
trigger1 = command = "FF"
trigger1 = statetype = S
trigger1 = ctrl = 1
trigger2 = command = "Dashforward2"
trigger2 = statetype = S
trigger2 = ctrl = 1

;RunBack
[State -1]
type = ChangeState
value = 105
trigger1 = command = "BB"
trigger1 = statetype = S
trigger1 = ctrl = 1
trigger2 = command = "Dashbackward2"
trigger2 = statetype = S
trigger2 = ctrl = 1

;---------------------------------------------------------------------------
;Black Cat stricker 
[State -1]
type = ChangeState
value = 8000
triggerall = power >= 500
triggerall = command = "yb"
triggerall = numhelper(8000) = 0
trigger1 = statetype != A
trigger1 = ctrl = 1
trigger2 = numhelper(8989) = 1

;---------------------------------------------------------------------------
;Standing Medium punch backwards throw
[State -1]
type = ChangeState
value = 900
triggerall = statetype = S
triggerall = ctrl = 1
triggerall = p2bodydist X < 9 ;Near P2
triggerall = command = "back_y"
triggerall = stateno != 100   ;Not running
triggerall = p2movetype != H
triggerall = p2Statetype != A
triggerall = p2Statetype != L
triggerall = p2stateno != 900
triggerall = p2stateno != 901
triggerall = p2stateno != 903
triggerall = p2stateno != 910
triggerall = p2stateno != 911
triggerall = p2stateno != 920
triggerall = p2stateno != 921
trigger1 = p2statetype = S
trigger2 = p2statetype = C

;Standing Medium punch forwards throw
[State -1]
type = ChangeState
value = 902
triggerall = statetype = S
triggerall = ctrl = 1
triggerall = p2bodydist X < 2 ;Near P2
triggerall = command = "fwd_y"
triggerall = stateno != 100   ;Not running
triggerall = p2movetype != H
triggerall = p2Statetype != A
triggerall = p2Statetype != L
triggerall = p2stateno != 900
triggerall = p2stateno != 901
triggerall = p2stateno != 903
triggerall = p2stateno != 910
triggerall = p2stateno != 911
triggerall = p2stateno != 920
triggerall = p2stateno != 921
trigger1 = p2statetype = S
trigger2 = p2statetype = C

;Standing Fierce punch backwards throw
[State -1]
type = ChangeState
value = 920
triggerall = statetype = S
triggerall = ctrl = 1
triggerall = p2bodydist X < 9
triggerall = command = "back_z"
triggerall = stateno != 100   ;Not running
triggerall = p2movetype != H
triggerall = p2Statetype != A
triggerall = p2Statetype != L
triggerall = p2stateno != 900
triggerall = p2stateno != 901
triggerall = p2stateno != 903
triggerall = p2stateno != 910
triggerall = p2stateno != 911
triggerall = p2stateno != 920
triggerall = p2stateno != 921
trigger1 = p2statetype = S
trigger2 = p2statetype = C

;Standing Fierce punch forwards throw
[State -1]
type = ChangeState
value = 910
triggerall = statetype = S
triggerall = ctrl = 1
triggerall = p2bodydist X < 2
triggerall = command = "fwd_z"
triggerall = stateno != 100   ;Not running
triggerall = p2movetype != H
triggerall = p2Statetype != A
triggerall = p2Statetype != L
triggerall = p2stateno != 900
triggerall = p2stateno != 901
triggerall = p2stateno != 903
triggerall = p2stateno != 910
triggerall = p2stateno != 911
triggerall = p2stateno != 920
triggerall = p2stateno != 921
trigger1 = p2statetype = S
trigger2 = p2statetype = C

;---------------------------------------------------------------------------
;Air Throw (forwards)
[State -1]
type = ChangeState
value = 950
triggerall = statetype = A
triggerall = p2bodydist X < 8
triggerall = p2bodydist Y > -20
triggerall = p2bodydist Y < 18
triggerall = p2statetype = A
triggerall = p2statetype != S
triggerall = p2Statetype != L
triggerall = p2stateno != 920
triggerall = p2stateno != 921
trigger1 = command = "fwd_y"
trigger1 = ctrl = 1
trigger2 = command = "fwd_z"
trigger2 = ctrl = 1
trigger3 = command = "fwd_y"
trigger3 = StateNo = 601
trigger3 = movehit
trigger3 = P2Life > 0
trigger3 = Time > 20
trigger4 = command = "fwd_z"
trigger4 = StateNo = 601
trigger4 = movehit
trigger4 = P2Life > 0
trigger4 = Time > 20
trigger5 = command = "fwd_y"
trigger5 = stateno = 611
trigger5 = movecontact
trigger5 = time > 20
trigger5 = P2Life > 0
trigger6 = command = "fwd_z"
trigger6 = stateno = 611
trigger6 = movecontact
trigger6 = time > 20
trigger6 = P2Life > 0
trigger7 = command = "fwd_y"
trigger7 = stateno = 631
trigger7 = movecontact
trigger7 = time > 20
trigger7 = P2Life > 0
trigger8 = command = "fwd_z"
trigger8 = stateno = 631
trigger8 = movecontact
trigger8 = time > 20
trigger8 = P2Life > 0


;Air Throw   (backwards)
[State -1]
type = ChangeState
value = 960
triggerall = statetype = A
triggerall = p2bodydist X < 8
triggerall = p2bodydist Y > -20
triggerall = p2bodydist Y < 18
triggerall = p2statetype = A
triggerall = p2statetype != S
triggerall = p2Statetype != L
triggerall = p2stateno != 920
triggerall = p2stateno != 921
trigger1 = command = "back_y"
trigger1 = ctrl = 1
trigger2 = command = "back_z"
trigger2 = ctrl = 1
trigger3 = command = "back_y"
trigger3 = StateNo = 601
trigger3 = movehit
trigger3 = P2Life > 0
trigger3 = Time > 20
trigger4 = command = "back_z"
trigger4 = StateNo = 601
trigger4 = movehit
trigger4 = P2Life > 0
trigger4 = Time > 20
trigger5 = command = "fwd_y"
trigger5 = stateno = 611
trigger5 = movecontact
trigger5 = time > 20
trigger5 = P2Life > 0
trigger6 = command = "fwd_z"
trigger6 = stateno = 611
trigger6 = movecontact
trigger6 = time > 20
trigger6 = P2Life > 0
trigger7 = command = "fwd_y"
trigger7 = stateno = 631
trigger7 = movecontact
trigger7 = time > 20
trigger7 = P2Life > 0
trigger8 = command = "fwd_z"
trigger8 = stateno = 631
trigger8 = movecontact
trigger8 = time > 20
trigger8 = P2Life > 0


;===========================================================================
; SuperJump 
[State -1]
type = ChangeState
value = 710
trigger1 = command = "down_up"
trigger1 = statetype != A
trigger1 = ctrl = 1
trigger2 = command = "3kicks"
trigger2 = statetype != A
trigger2 = ctrl = 1

;---------------------------------------------------------------------------
;Stand X (weak punch)
[State -1]
type = ChangeState
value = 200
triggerall = command = "x"; Weak punch X
triggerall = command != "holddown"
 ;The following is true if Player is in stand state, and has control
trigger1 = statetype = S
trigger1 = ctrl = 1

;---------------------------------------------------------------------------
;Stand Y (Medium punch)
[State -1]
type = ChangeState
value = 201
triggerall = command = "y"; Medium punch Y
triggerall = command != "holddown";Standing moves should have this line
trigger1 = statetype = S
trigger1 = ctrl = 1
trigger2 = (stateno = 200) && time > 2
trigger2 = movecontact
trigger3 = stateno = 400
trigger3 = movecontact
trigger3 = time >= 3
trigger4 = stateno = 210
trigger4 = movecontact
trigger5 = stateno = 410
trigger5 = movecontact

;---------------------------------------------------------------------------
;Stand Z (Fierce punch)
[State -1]
type = ChangeState
value = 202
triggerall = command = "z"; Fierce punch Z
triggerall = command != "holddown"
trigger1 = statetype = S
trigger1 = ctrl = 1
trigger2 = stateno = 201
trigger2 = movecontact
trigger2 = time >= 5
trigger3 = stateno =200
trigger3 = movecontact
trigger3 = time >= 2
trigger4 = stateno =210
trigger4 = movecontact
trigger5 = stateno =211
trigger5 = movecontact
trigger6 = stateno =401
trigger6 = movecontact
trigger7 = stateno =400
trigger7 = movecontact
trigger8 = stateno =411
trigger8 = movecontact

;---------------------------------------------------------------------------
;Stand_A (Weak kick)
[State -1]
type = ChangeState
value = 210
triggerall = command = "a"; Weak kick A
triggerall = command != "holddown"
trigger1 = statetype = S
trigger1 = ctrl = 1 
;trigger2 = stateno = 210
;trigger2 = time >= 9

;---------------------------------------------------------------------------
;Stand_B (Medium kick)
[State -1]
type = ChangeState
value = 211
triggerall = command = "b"
triggerall = command != "holddown"
trigger1 = statetype = S
trigger1 = ctrl = 1
trigger2 = stateno = 200
trigger2 = movecontact
trigger2 = time >= 2
trigger3 = stateno = 210
trigger3 = movecontact
trigger3 = time >= 3
trigger4 = stateno = 400
trigger4 = movecontact
;trigger4 = time >= 3
trigger5 = stateno = 410
trigger5 = movecontact
trigger5 = time >= 3

;---------------------------------------------------------------------------
;Stand_C (Fierce kick)
[State -1]
type = ChangeState
value = 212
triggerall = command = "c"
triggerall = command != "holddown"
trigger1 = statetype = S
trigger1 = ctrl = 1
trigger2 = stateno = 211
trigger2 = movecontact
trigger2 = time >= 2
trigger3 = stateno = 210
trigger3 = movecontact
trigger3 = time >= 3
trigger4 = stateno = 200
trigger4 = movecontact
trigger4 = time >= 2
trigger5 = stateno = 411
trigger5 = movecontact
trigger5 = time >= 3
;trigger5 = time < 9
trigger6 = stateno = 401
trigger6 = movecontact
trigger7 = stateno = 201
trigger7 = movecontact
trigger7 = time > 6

;---------------------------------------------------------------------------
;Crouch_X
[State -1]
type = ChangeState
value = 400
triggerall = command = "x"
triggerall = command = "holddown"
trigger1 = statetype = C
trigger1 = ctrl = 1
trigger2 = stateno = 400
trigger2 = movecontact
trigger2 = time >11

;---------------------------------------------------------------------------
;Crouch_Y
[State -1]
type = ChangeState
value = 401
triggerall = command = "y"
triggerall = command = "holddown"
trigger1 = statetype = C
trigger1 = ctrl = 1
trigger2 = stateno = 400
trigger2 = movecontact
trigger2 = time > 3
trigger3 = stateno = 200
trigger3 = movecontact
;trigger3 = time >= 3
trigger4 = stateno = 410
trigger4 = movecontact
;---------------------------------------------------------------------------
;Crouch_Z
[State -1]
type = ChangeState
value = 402
triggerall = command = "z"
triggerall = command = "holddown"
trigger1 = statetype = C
trigger1 = ctrl = 1
trigger2 = stateno = 401
trigger2 = movecontact
;trigger2 = time > 5
trigger3 = stateno = 400
trigger3 = movecontact
trigger4 = stateno = 411
trigger4 = movecontact
;---------------------------------------------------------------------------
;Crouch_A
[State -1]
type = ChangeState
value = 410
triggerall = command = "a"
triggerall = command = "holddown"
trigger1 = statetype = C
trigger1 = ctrl = 1

;---------------------------------------------------------------------------
;Crouch_B
[State -1]
type = ChangeState
value = 411
triggerall = command = "b"
triggerall = command = "holddown"
trigger1 = statetype = C
trigger1 = ctrl = 1
trigger2 = stateno = 400
trigger2 = movecontact
trigger2 = time >= 2
trigger3 = stateno = 410
trigger3 = movecontact
trigger3 = time >= 2
trigger4 = stateno = 200
trigger4 = movecontact

;---------------------------------------------------------------------------
;Crouch_C
[State -1]
type = ChangeState
value = 412
triggerall = command = "c"
triggerall = command = "holddown"
trigger1 = statetype = C
trigger1 = ctrl = 1
trigger2 = stateno = 411
trigger2 = movecontact
trigger2 = time > 7
trigger3 = stateno = 211
trigger3 = movecontact
trigger3 = time >= 2
trigger4 = stateno = 200
trigger4 = movecontact
trigger4 = time >= 2
trigger5 = stateno = 410
trigger5 = movecontact
trigger5 = time >= 2
trigger6 = stateno = 210
trigger6 = movecontact
trigger6 = time >= 2
trigger7 = stateno = 400
trigger7 = movecontact
trigger7 = time >= 2
trigger8 = stateno = 401
trigger8 = movecontact
trigger8 = time >= 2
trigger9 = stateno = 201
trigger9 = movecontact

;--------------------------------------------------------------------------
; Normal Jump attacks
;---------------------------------------------------------------------------
;Jump_X (Weak punch)
[State -1]
type = ChangeState
value = 600
;triggerall = stateno != 710
triggerall = command = "x"
trigger1 = statetype = A
trigger1 = ctrl= 1
trigger2 = stateno = 100

;---------------------------------------------------------------------------
;Jump_Y (medium punch)
[State -1]
type = ChangeState
value = 601
triggerall = command = "y"
;triggerall = stateno != 700
trigger1 = statetype = A
trigger1 = ctrl = 1 
trigger2 = stateno = 600
trigger2 = movecontact
trigger3 = stateno = 610
trigger3 = movehit
trigger4 = stateno = 100

;---------------------------------------------------------------------------
;Jump_Z (Fierce punch)
[State -1]
type = ChangeState
value = 602
triggerall = command = "z"
;triggerall = stateno != 700
trigger1 = statetype = A
trigger1 = ctrl = 1
trigger2 = stateno = 600
trigger2 = movecontact
trigger3 = stateno = 601
trigger3 = movecontact
trigger4 = stateno = 611
trigger4 = movehit
trigger5 = stateno = 631
trigger5 = movehit
trigger6 = stateno = 100

;--------------------------------------------------------------------------
;Jump_A
[State -1]
type = ChangeState
value = 610
triggerall = command = "a"
;triggerall = stateno != 700
trigger1 = statetype = A
trigger1 = ctrl = 1
trigger2 = stateno = 600
trigger2 = movecontact
trigger3 = stateno = 100

;Jump_B
[State -1]
type = ChangeState
value = 631
triggerall = command = "b"
trigger1 = statetype = A
trigger1 = ctrl = 1
trigger2 = stateno = 600
trigger2 = movecontact
trigger3 = stateno = 601
trigger3 = movecontact
trigger4 = stateno = 610
trigger4 = movecontact
trigger5 = stateno = 100

;;---------------------------------------------------------------------------
;;Jump_B
;[State -1]
;type = ChangeState
;value = 611
;triggerall = command = "b"
;triggerall = stateno ! = 700
;triggerall = Stateno ! = 600
;triggerall = Stateno ! = 601
;triggerall = Stateno ! = 610
;trigger1 = statetype = A
;trigger1 = ctrl = 1
;trigger2 = stateno = 600
;trigger2 = movecontact
;trigger3 = stateno = 601
;trigger3 = movecontact
;trigger4 = stateno = 610
;trigger4 = movecontact
;trigger5 = stateno = 100

;---------------------------------------------------------------------------
;Jump_C
[State -1]
type = ChangeState
value = 612
triggerall = command = "c"
;triggerall = stateno != 700
trigger1 = statetype = A
trigger1 = ctrl = 1
trigger2 = stateno = 600
trigger2 = movehit
trigger3 = stateno = 602
trigger3 = movehit
trigger3 = time > 8
trigger4 = stateno = 611
trigger4 = movehit
trigger5 = stateno = 610
trigger5 = movehit
trigger6 = stateno = 601
trigger6 = movehit
trigger7 = stateno = 631
trigger7 = movehit
trigger8 = stateno = 100

;---------------------------------------------------------------------------
;Taunt 
[State -1]
type = ChangeState
value = 195
triggerall = command = "s"
trigger1 = statetype = S
trigger1 = ctrl = 1
trigger2 = statetype = C
trigger2 = ctrl = 1
;----------------------------------------------------------------------------
;Wall Cling
[State -1]
type = ChangeState
value = 750
triggerall = command = "holdfwd"
trigger1 = Pos Y < -120
trigger1 = Pos Y > -300
trigger1 = ctrl = 1
trigger1 = statetype = A
trigger1 = BackEdgeDist < 2
trigger1 = Stateno != 751
trigger1 = Stateno != 752

