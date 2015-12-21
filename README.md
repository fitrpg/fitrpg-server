<img src="/readme/github_promo.png"/>
<a href="https://play.google.com/store/apps/details?id=com.fatchickenstudios.fitrpg">
  <img alt="Get it on Google Play"
       src="readme/google_play.png" />
</a>

FitRPG is a mobile app created by [Amira Anuar](https://github.com/aellawind), [Matt Gutierrez](https://github.com/fatchicken007), and [Conor Fennell](https://github.com/conorfennell) at [Hack Reactor](http://www.hackreactor.com/). FitRPG transforms a Fitbit user's data into a character that can fight friends, battle bosses, and go on quests using the steps, distance, and sleep tracked by the Fitbit. The game logic seeks to motivate users to stay fit and challenge themselves to go that extra mile in order to win a battle or complete a quest.


<h2>Tech Stack</h2>
  * [Ionic Framework](http://ionicframework.com/)
  * [AngularJS](https://angularjs.org/)
  * [Node.js](http://nodejs.org/)
  * [Express.js](http://expressjs.com/)
  * [MongoDB](http://www.mongodb.org/)

<h2>Code Base</h2>
  * [Client side](https://github.com/fitrpg/fitrpg-ionic)
  * [Server side](https://github.com/fitrpg/fitrpg-server)

<b>Challenges</b>:
  * User flow during fitbit OAuth  
    *  Originally we wanted to do the OAuth login client side on the app. But due to fitbit using OAuth 1.0 and not allowing CORS or JSONP, it had to be done server side. This was a challenge since the server redirects your app during the OAuth process and takes you out of the app context. We had to find a way to keep this redirect within the app and inform the app if the authentication was successful. See our blog post that walks through how we did this server side, here: [Mobile Authentication in Ionic with OAuth Through External APIs: Fitbit Pt 1, Server](http://amiraanuar.com/mobile-authentication-in-ionic-with-oauth-through-external-apis-fitbit-pt-1-server/)
  * Game logic design
    * Balancing how sleep, steps and other activities relate to the characters attributes and making sure one is not more effective than other attributes.
  * User interface design
    * A game can have a lot of different options and views, reducing and compressing these views and making them intuitive is a challenge.
  * Security
    * Implementing json web tokens
    * OAuth
