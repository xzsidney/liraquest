=================================================================================================
                  --------------------| SANDER 71113 |-------------------
                                  http://go.to/sander71113 
                                    sander71113@yahoo.com

==============
 Wolverine X
==============
Date: 1/03/02


 *** WHY WOLVERINE? ***

 I find it wierd that most of the respected Mugen Character Developers showed no interest on
 Wolverine, except maybe for M@ppy. I've been waiting for his wolverine release but sadly, I 
 heard he retired from developing. Since I wanted to try my hand at a Capcom character and 
 Venom bored me, I decided to go for it. So here it is, the fruit of a month's labor, ready to
 be stolen or updated by moronic thieves. Thanks to my boredom with KOF characters, I present 
 you WolverineX. ^^

 *** CHARACTER ***
  
 Wolvie was mainly ripped from "Marvel Super Heroes". I then added the extra moves from 
 "Xmen vs Street fighter" and "Marvel Vs Capcom". His -gameplay- is based on "MvC". I dunno
 if I'll update him into his MVC2 incarnation, maybe if I play with it a bit more. Please
 take the time to read the accompanying docs, to prevent useless questions on my already 
 spammed email. Mugenized by Sander71113 (sander71113@yahoo.com). 

 *** Artificial Intelligence ***
 
 WolverineX has a 3 level AI. All you have to do is edit wolverine.def using notepad.
 	
	;cmd      = wolverine.cmd        ;Hard Ai
	;cmd      = wolmedai.cmd         ;Medium level Ai    
	cmd       = wolnoai.cmd          ;Low level Ai

 Just remove the semicolon AT THE START OF THE LINE before the ai level of your choice and make 
 sure the unwanted levels have semicolon before them. In the example above, it is setup to use
 low level AI.

 *** Optional HyperBGs ***
 
 You can disable/enable the hyperbgs by simply switching his cns in the def file.
 	
	;st5      = wolverined.cns   		;Super Moves
        st5       = wolverinedx.cns             ;Super Moves "Without Hyper BGs" 
	
 Just remove the semicolon AT THE START OF THE LINE before the option of your choice and make 
 sure the unwanted options have semicolon before them. In the example above, it is setup to use
 No HyperBGs.

 *** M.U.G.E.N. ***
 
 To use Wolverine X, you need the latest build of "M.U.G.E.N." engine 
 which can found at http://www.elecbyte.com. 

 *** WOLVERINEX FILES AND USE ***

 Upon unzipping the Zip file(s), You should now have these:
 
 DOCUMENTATIONS:
 Readme.txt
 history.txt
 
 CODES:
 wolverine.def       wolverine.cmd           
 wolverine.cns       wolverinea.cns        
 wolverineb.cns      wolverinec.cns          
 wolverined.cns      wolverinedx.cns
 wolverine.air       wolmedai.cmd        
 wolnoai.cmd

 SPRITES:
 wolverine.sff   

 SOUNDS:
 logan.snd 
 
 PALETTES:
 pal1.act
 pal2.act
 pal3.act 
 
 Unzip or Put all the files into a folder named wolverine and insert this wolverine folder 
 into the chars folder of your M.U.G.E.N. You can add wolverine to your Select Screen by simply 
 adding the line "wolverine" to your "select.cfg" under the [Characters] section.

 *** WOLVERINE X SPECIAL SYSTEMS ***

    * GUARD CRUSH  - Wolverine can be Guard Crushed. So don't block too much :P. My Guard Crush 
                     System is not KOF accurate since it is still not built into the M.U.G.E.N.
                     engine itself. This is just a "work around". It works much like SFA3. 
                     You can see the guard crush points in debug display. I think I should remove 
                     Guard crush because there is none in any of the vs games. :P

    * DIZZY        - Wolverine is dizzy-able. Again this is not MvC accurate. You can also check 
                     the dizzy points in Debug Display.                     

    * TECH HIT     - Tired of being thrown around? You cancel wolvie's throws by pressing any 
                     punch button during the first few frames of his throw.

 *** M.U.G.E.N. JOYSTICK CONFIGURATION ***
 
   (Player 1)

    *- DIRECTION KEYS

		     (U)           U = up        DF = downforward
    
 		 (B)  x  (F)       B = back      DB = downback
  
  		     (D)           F = Forward   UF = upforward

		                   D = down      UB = upback

     *- BUTTONS

		 (x) (y) (z)       x = Light punch    y = Medium punch z = Fierce punch
                   
		 (a) (b) (c)       a = Light kick     b = Medium kick    c = Fierce kick

		     (s)                              s = start

 *** COMMANDS MOVES ***

  ** THROWS **
  Note: Throws are cancelable

  Ground:
  F, (y) [WHEN CLOSE]  - Back Stab			
  F, (z) [WHEN CLOSE]  - Ride and Stab

  Aerial:
  F, (y) [WHEN CLOSE]  - Air Stab		
  F, (z) [WHEN CLOSE]  - Air Stab
 
  ** EXTRA BASIC ATTACKS **
  
  Ground:
  Slide Slash = DF, z
  Launcher    = c

  Aerial:
  Head Stomp  = D, c
  Dive Kick   = D, b
  
  ** SPECIAL ATTACKS **
  
  Berserker Slash = D,DB,B, any punch button
  - Wolverine dashes forward then slices the enemy. Has projectile invincibility properties 
    during startup. Button used determines distance travelled.

  Berserker Barrage = D,DF,F, any punch button
  - Wolverine slashes like crazy. Button used determines the distance. Press punch buttons 
    repeatedly for more hits.

  Drill Claw = Y+A, any direction
  - Wolverine spins and hits the enemy. Multi-Directional and can be done in the air.

  Tornado Claw = F,D,DF, any punch button
  - Wolverine slashes in an upward manner. Button used determines height. Press punch buttons 
    repeatedly for more hits.

  ** HYPER ATTACKS **
  
  Berserker Barrage X = D,DF,F, any 2 punch buttons
  - Wolverine slashes MORE like crazy. 

  Weapon X = F,D,DF, any 2 punch buttons
  - Wolverine dashes forward and does a multiple hit attack which ends with a flashy X slash.
    Move has very slow start up time. Has projectile invincibility properties during start up.
  
  Fatal Claw X = F,D,DF, any 2 kick buttons
  - Wolverine leaps up while a big X slash appears and hits the enemy. Can also be done in the 
    air.

  Speed Factor = D,DB,B, any 2 punch buttons
  - Wolverine slashes and shadows(clones) appear. Wolvie is faster now for a few game ticks 
    (600-700).

  Healing Factor = D,DB,B, any 2 kick buttons
  - Wolverine simply uses his healing powers to heal some of his wounds. Restores a bit of life.

  1337 X = ?????
  - Secret... :P

 *** HISTORY ***
 
 To see WolverineX's progress and to know what's new on this release, see History.txt
 
 *** DISCLAIMER ***
  
 Mugen and all related files are free as of the date of this release, so if you bought this,
 you've been spoofed. All the files included in the zip are mine. All the sprites and sounds
 are from Capcom.  I will not be held responsible for any damage these files can do to your 
 computer or to your life. These files are not considered roms, emulator, warez etc. You can 
 modify this only for your own use, NEVER EDIT THIS CHARACTER AND RELEASE IT AND CALL IT YOUR 
 WORK, don't be an idiot. If you think some of my codings, ideas, rips etc. helped you... 
 Don't Forget to credit me :)
 

*** CREDITS: ***

         
        CAPCOM AND MARVEL  - For making Wolverine, and giving me an opportunity to waste 
                             my time.
 
        ELECBYTE           - For making M.U.G.E.N... the Best 2D fighting game engine!

        FINALBURN/SFMAME   - For the rips and arcade at home fun.

        QPLAYER            - Sound rips              
        
        Ses'MCM            - For making mugen life a bit more bearable    

        Rag's MEE          - For making mugen life a lot more bearable.

        K_Kusanag          - Beta testing.

        Titiln             - Beta testing and super portraits.

        Splode             - For the HyperBGs and advice.

        B.B. Hood          - For the Ai Guard Triggers.

        Messatsu           - Beta testing, negative edge and some palettes.

        Mugen Boards       - For some help and a lot of frustrations...

        #Mugen/#Mrev       - For being fun, idle and of some help... XD

        Paula              - For making me feel good all over. ;)

        JESUS              - Whom everything is of and for...

        ME..(SANDER71113)  - For wasting my time in completing this project.                 

        And to everyone who enjoys M.U.G.E.N.....


        ---- If you think you deserve to be acknowledged email me.. ----

---------------------------------------------------------------------------------------------
 *** ABOUT ***
 
 For bugs and comments, suggestions or whatever email me at:
 EMAIL   :   sander71113@yahoo.com
 WEB PAGE:   http://go.to/sander71113
             http://sander71113.mgbr.net             
===================================== END OF README.TXT =====================================

