          Gambit by Luvly Angel (a_luvly@hotmail.com / ICQ# 55776859)
               Downloaded/Originated From: mugenlove.mgbr.net
------------------------------------------------------------------------------
Developed under Mugen Version 01.04.14 only
Latest MUGEN fighting engine can be found at: http://www.elecbtye.com
------------------------------------------------------------------------------
Started  : June 02, 2001
Release 1: June 18, 2001
Release 2: June 27, 2001
Release 3: October 16, 2001
Release 4: October 22, 2001

                __                             ___            _aaaa
               d8888aa,_                    a8888888a   __a88888888b
              d8P   `Y88ba.                a8P'~~~~Y88a888P""~~~~Y88b
             d8P      ~"Y88a____aaaaa_____a8P        888          Y88
            d8P          ~Y88"8~~~~~~~88888P          88g          88
           d8P                           88      ____ _88y__       88b
           88                           a88    _a88~8888"8M88a_____888
           88                           88P    88  a8"'     `888888888b_
          a8P                           88     88 a88         88b     Y8,
           8b                           88      8888P         388      88b
          a88a                          Y8b       88L         8888.    88P
         a8P                             Y8_     _888       _a8P 88   a88
        _8P                               ~Y88a888~888g_   a888yg8'  a88'
        88                                   ~~~~    ~""8888        a88P
       d8'                                                Y8,      888L
       8E                                                  88a___a8"888
      d8P                                                   ~Y888"   88L
      88                                                      ~~      88
      88                                                              88
      88                                                              88b
  ____88a_.      a8a                                                __881
88""P~888        888b                                 __          8888888888
      888        888P                                d88b             88
     _888ba       ~            aaaa.                 8888            d8P
 a888~"Y88                    888888                 "8P          8aa888_
        Y8b                   Y888P"                                88""888a
        _88g8                  ~~~                                 a88    ~~
    __a8"888_                                                  a_ a88
   88"'    "88g                                                 "888g_
   ~         `88a_                                            _a88'"Y88gg,
                "888aa_.                                   _a88"'      ~88
                   ~~""8888aaa______                ____a888P'
                           ~~""""""888888888888888888""~~~
                                      ~~~~~~~~~~~~


------------------------------------------------------------------------------
Table of Contents
------------------------------------------------------------------------------

 1.0 - Introduction
 2.0 - What's New
 3.0 - What's Left
 4.0 - Move List
   4.1 - Basic Attacks
   4.2 - Special Attacks
   4.3 - Super Attacks
 5.0 - Misc/Comments
 6.0 - Credits


------------------------------------------------------------------------------
1.0 Introduction
------------------------------------------------------------------------------

 Custom AI and new palletes are on the way. >=)


------------------------------------------------------------------------------
2.0 What's Done
------------------------------------------------------------------------------

October 22, 2001
----------------
 - Made custom states for apocalypse/onslaught, now gambit can hit them with
   the attacks that use p2stateno.
 - Made it possible for the Royal Flush and Kinetic Charge Custom Super to hit
 - Fixed other stuff


October 16, 2001
----------------
 - Hit Wall Spark and Hit Ground Spark added when opponent makes contact
 - Made the hits proper now (no more infinite jab combos)
 - Added a Custom Super... it looks AWFUL!! (for now)
 - Fixed the Super Potraits (it was off by 2 ticks XD)
 - Fixed a few timings of some move
 - Improved the vs series hit bounce coding
 - Improved the p2state aerial rave custom gethit
 - Fixed a few velocity (Gambit jumps higher for super jumps)
 - FIXed alot of other stuff (i doubt some ppl well see the difference)

 
June 27, 2001
-------------
 - Fixed the Cajun Explosion
 - Made the Kinetic Card -Air more accurate
 - More Pallette
 - Fix Many Many Bugs
 - 2 Pallette

 
June 17, 2001
-------------
 
 - All Attacks (S/C/A)
 - All Basic Movements
 - All Required Sprites
 - 2 Throws
 - Intro
 - 3 Win Poses
 - Time Out / Draw Frame
 - Dizzy Frame
 - Comboing System
 - Special Effects
 - Fixed Timing On All Moves
 - Forward Dash
 - Back Dash
 - Kenetic Card
 - Kenetic Card - Diagonal (air)
 - Trick Card
 - Cajun Slash
 - Cajun Strike
 - Royal Flush
 - Cajun Explosion (Thanks Tenshin)
 - X bg when opponent killed with super


------------------------------------------------------------------------------
3.0 What's Left
------------------------------------------------------------------------------

 - Some more spark effects
 - AI
 - MVC Palletes


------------------------------------------------------------------------------
4.0 Move List
------------------------------------------------------------------------------

Key Layout:

[ x ] [ y ] [ z ]		a - Short 		x - Jab
 | |   | |   | |		b - Forward		y - Strong
[ a ] [ b ] [ c ]		c - Roundhouse	z - Fierce


4.1 Basic Attacks
-----------------

- Throw (punch)
	(close) f + Y/Z
- Throw (kick)
	(close) f + B/C

4.2 Special Attacks
-------------------

- Kenetic Card
	D, DF, F + Punch
	in the air, D, DF, F + Punch
- Trick Card
	D, DB, B + Punch
- Cajun Slash
	F, D, DF + Punch
- Cajun Strike
	Hold D, U + P/K
		-Hold F to jump to the other side

4.3 Super Attacks
-----------------

 - Royal Flush
	D, DF, F + 2Punches
 - Custom Kinetic Charge Super
	D, DB, B + 2Punches
 - Cajun Explosion
	D, DF, F + 2Kicks
	D, DB, B + 2Kicks


------------------------------------------------------------------------------
5.0 Misc/Comments
------------------------------------------------------------------------------

 - You can do some crazy combo when the opponent is in the corner, for example:
	    15-hit combo
	LP, MP, HP, Kinetic Card (qcf+punch), walk close when opponent is in
	hit state, then, c+LP, c+MP, c+HP, high jump, LP, MP, HP, Kinetic Card
	-air (qcf+punch), when land, c+LP, c+MP, c+HP, Trick Card (qcb+punch)
 - After the kick throw, use the Kinetic Card -air (qcf+punch) to attack the
	opponent while they are still laying down
	    * no, this wasn't in xmvsf or mvc
 - Super Cancel: Royal Flush (qcf+2p) -> Custom Kinetic Charge Super (qcb+2p)
      -> Cajun Explosion (qcf+2k)
 - The Cajun Explosion is trigger either if Gambit is near the wall, OR IF HIS
	Y Velocity IS ABOVE '1'. This prevents Gambit failing to do his super.
	So if Gambit is in the middle of the screen doing the super, yeah, it
	looks weird but, oh well.


------------------------------------------------------------------------------
6.0 Credits
------------------------------------------------------------------------------

 - Elecbyte, for MUGEN 2d fighting engine
 - Capcom/Marvel, for their 'Vs Series'.
 - Myself, because I actually devoted my time to make this character
 - Tenshin, for the MVC Cajun Explosion sprites
 - Mizuki, for ripping the Cajun Explosion sounds for me
 - Cabbit, for letting meeh stare as he wiggles his cute butt
 - #mugen on EFnet, for letting me jump kicking them
 - And all the other ppl who I didn't mention, who did help meeh . . . sorry


                                                               © HiKitty