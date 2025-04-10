package game

import scala.concurrent.duration._

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.jdbc.Predef._

class PlayNewGameTest extends Simulation {

  private val httpProtocol = http
    .baseUrl("http://localhost:8000")
    .inferHtmlResources()
    .acceptHeader("application/json, text/plain, */*")
    .acceptEncodingHeader("gzip, deflate")
    .acceptLanguageHeader("es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3")
    .userAgentHeader("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0")
  
  private val headers_0 = Map(
  		"Accept" -> "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8",
  		"If-None-Match" -> """"826abfa926e178ef2a52bf0e3063084e42c7b6d4"""",
  		"Priority" -> "u=0, i",
  		"Upgrade-Insecure-Requests" -> "1"
  )
  
  private val headers_1 = Map(
  		"Accept" -> "*/*",
  		"If-None-Match" -> """"ac470c1403035baca4969943aa8259f67ee2d5b7""""
  )
  
  private val headers_2 = Map(
  		"Accept" -> "text/css,*/*;q=0.1",
  		"If-None-Match" -> """"122dba475db1854d3c98642e41b72e1591fc2539"""",
  		"Priority" -> "u=2"
  )
  
  private val headers_3 = Map(
  		"Accept" -> "*/*",
  		"Access-Control-Request-Headers" -> "content-type",
  		"Access-Control-Request-Method" -> "POST",
  		"Origin" -> "http://localhost:3000",
  		"Priority" -> "u=4"
  )
  
  private val headers_4 = Map(
  		"Content-Type" -> "application/json",
  		"Origin" -> "http://localhost:3000",
  		"Priority" -> "u=0"
  )
  
  private val headers_5 = Map(
  		"If-None-Match" -> """W/"62d-KhFnIFoVPfoK2stJGO7EsiIiYNc"""",
  		"Origin" -> "http://localhost:3000"
  )
  
  private val headers_9 = Map(
  		"Content-Type" -> "application/json",
  		"Origin" -> "http://localhost:3000"
  )
  
  private val headers_10 = Map(
  		"Accept" -> "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
  		"Priority" -> "u=5, i"
  )
  
  private val headers_12 = Map(
  		"Accept" -> "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
  		"Accept-Encoding" -> "gzip, deflate, br, zstd",
  		"Priority" -> "u=4, i",
  		"Sec-Fetch-Dest" -> "image",
  		"Sec-Fetch-Mode" -> "no-cors",
  		"Sec-Fetch-Site" -> "cross-site"
  )
  
  private val headers_20 = Map(
  		"If-None-Match" -> """W/"db-1z66aAXe/KN4M+OW50vof8I91bo"""",
  		"Origin" -> "http://localhost:3000"
  )
  
  private val headers_29 = Map(
  		"If-None-Match" -> """W/"f4-aic20EX6a97L/SKJRh8KNEL+u1w"""",
  		"Origin" -> "http://localhost:3000"
  )
  
  private val headers_36 = Map(
  		"If-None-Match" -> """W/"11a-P3gL9w1epzw6DWmWHSiYBR3ZUlk"""",
  		"Origin" -> "http://localhost:3000"
  )
  
  private val headers_43 = Map(
  		"If-None-Match" -> """W/"ea-ENYsE2L6k0iZvF8EYMyWAVsIckM"""",
  		"Origin" -> "http://localhost:3000"
  )
  
  private val headers_52 = Map(
  		"If-None-Match" -> """W/"8e0e-AHC7Md7bGW18nMothrNg2/f3XK0"""",
  		"Origin" -> "http://localhost:3000",
  		"Priority" -> "u=0"
  )
  
  private val uri1 = "commons.wikimedia.org"
  
  private val uri2 = "localhost"
  
  private val uri3 = "https://upload.wikimedia.org/wikipedia/commons/c/c6/Algeria_-_Location_Map_%282013%29_-_DZA_-_UNOCHA.svg"

  private val scn = scenario("PlayNewGameTest")
    .exec(
      http("request_0")
        .get("http://" + uri2 + ":3000/")
        .headers(headers_0)
        .resources(
          http("request_1")
            .get("http://" + uri2 + ":3000/static/js/main.b4f0bfa3.js")
            .headers(headers_1),
          http("request_2")
            .get("http://" + uri2 + ":3000/static/css/main.d8168a55.css")
            .headers(headers_2)
        )
    )
    .pause(9)
    .exec(
      http("request_3")
        .options("/login")
        .headers(headers_3)
        .resources(
          http("request_4")
            .post("/login")
            .headers(headers_4)
            .body(RawFileBody("game/playnewgametest/0004_request.json")),
          http("request_5")
            .get("/get-sessions/pablo")
            .headers(headers_5)
        )
    )
    .pause(2)
    .exec(
      http("request_6")
        .options("/startGame")
        .headers(headers_3)
        .resources(
          http("request_7")
            .post("/startGame")
            .headers(headers_4)
            .body(RawFileBody("game/playnewgametest/0007_request.json")),
          http("request_8")
            .options("/configureAssistant")
            .headers(headers_3),
          http("request_9")
            .post("/configureAssistant")
            .headers(headers_9)
            .body(RawFileBody("game/playnewgametest/0009_request.json")),
          http("request_10")
            .get("http://" + uri1 + "/wiki/Special:FilePath/Algeria%20-%20Location%20Map%20%282013%29%20-%20DZA%20-%20UNOCHA.svg")
            .headers(headers_10),
          http("request_11")
            .post("/configureAssistant")
            .headers(headers_9)
            .body(RawFileBody("game/playnewgametest/0011_request.json")),
          http("request_12")
            .get("https://" + uri1 + "/wiki/Special:FilePath/Algeria%20-%20Location%20Map%20%282013%29%20-%20DZA%20-%20UNOCHA.svg")
            .headers(headers_12),
          http("request_13")
            .get(uri3)
            .headers(headers_12),
          http("request_14")
            .post("/configureAssistant")
            .headers(headers_9)
            .body(RawFileBody("game/playnewgametest/0014_request.json")),
          http("request_15")
            .post("/configureAssistant")
            .headers(headers_9)
            .body(RawFileBody("game/playnewgametest/0015_request.json"))
        )
    )
    .pause(1000.milliseconds)
    .exec(
      http("request_16")
        .options("/configureAssistant")
        .headers(headers_3)
        .resources(
          http("request_17")
            .post("/configureAssistant")
            .headers(headers_9)
            .body(RawFileBody("game/playnewgametest/0017_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_18")
        .post("/configureAssistant")
        .headers(headers_9)
        .body(RawFileBody("game/playnewgametest/0018_request.json"))
        .resources(
          http("request_19")
            .post("/configureAssistant")
            .headers(headers_4)
            .body(RawFileBody("game/playnewgametest/0019_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_20")
        .get("/nextQuestion?category=Geografia")
        .headers(headers_20)
        .resources(
          http("request_21")
            .post("/configureAssistant")
            .headers(headers_9)
            .body(RawFileBody("game/playnewgametest/0021_request.json")),
          http("request_22")
            .get("http://" + uri1 + "/wiki/Special:FilePath/Aj-map.png")
            .headers(headers_10),
          http("request_23")
            .post("/configureAssistant")
            .headers(headers_9)
            .body(RawFileBody("game/playnewgametest/0023_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_24")
        .options("/configureAssistant")
        .headers(headers_3)
        .resources(
          http("request_25")
            .post("/configureAssistant")
            .headers(headers_9)
            .body(RawFileBody("game/playnewgametest/0025_request.json")),
          http("request_26")
            .post("/configureAssistant")
            .headers(headers_9)
            .body(RawFileBody("game/playnewgametest/0026_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_27")
        .post("/configureAssistant")
        .headers(headers_9)
        .body(RawFileBody("game/playnewgametest/0027_request.json"))
        .resources(
          http("request_28")
            .post("/configureAssistant")
            .headers(headers_4)
            .body(RawFileBody("game/playnewgametest/0028_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_29")
        .get("/nextQuestion?category=Geografia")
        .headers(headers_29)
        .resources(
          http("request_30")
            .post("/configureAssistant")
            .headers(headers_9)
            .body(RawFileBody("game/playnewgametest/0030_request.json")),
          http("request_31")
            .get("http://" + uri1 + "/wiki/Special:FilePath/Satellite%20image%20of%20Cape%20Verde%20in%20December%202002.jpg")
            .headers(headers_10),
          http("request_32")
            .options("/configureAssistant")
            .headers(headers_3),
          http("request_33")
            .post("/configureAssistant")
            .headers(headers_9)
            .body(RawFileBody("game/playnewgametest/0033_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_34")
        .post("/configureAssistant")
        .headers(headers_9)
        .body(RawFileBody("game/playnewgametest/0034_request.json"))
        .resources(
          http("request_35")
            .post("/configureAssistant")
            .headers(headers_4)
            .body(RawFileBody("game/playnewgametest/0035_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_36")
        .get("/nextQuestion?category=Geografia")
        .headers(headers_36)
        .resources(
          http("request_37")
            .post("/configureAssistant")
            .headers(headers_9)
            .body(RawFileBody("game/playnewgametest/0037_request.json")),
          http("request_38")
            .get("http://" + uri1 + "/wiki/Special:FilePath/Cidade%20Maravilhosa.jpg")
            .headers(headers_10),
          http("request_39")
            .post("/configureAssistant")
            .headers(headers_9)
            .body(RawFileBody("game/playnewgametest/0039_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_40")
        .options("/configureAssistant")
        .headers(headers_3)
        .resources(
          http("request_41")
            .post("/configureAssistant")
            .headers(headers_9)
            .body(RawFileBody("game/playnewgametest/0041_request.json")),
          http("request_42")
            .post("/configureAssistant")
            .headers(headers_4)
            .body(RawFileBody("game/playnewgametest/0042_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_43")
        .get("/nextQuestion?category=Geografia")
        .headers(headers_43)
        .resources(
          http("request_44")
            .post("/configureAssistant")
            .headers(headers_9)
            .body(RawFileBody("game/playnewgametest/0044_request.json")),
          http("request_45")
            .get("http://" + uri1 + "/wiki/Special:FilePath/Damascus%2C%20Syria%2C%20Panoramic%20view%20of%20Damascus.jpg")
            .headers(headers_10),
          http("request_46")
            .post("/configureAssistant")
            .headers(headers_9)
            .body(RawFileBody("game/playnewgametest/0046_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_47")
        .post("/configureAssistant")
        .headers(headers_9)
        .body(RawFileBody("game/playnewgametest/0047_request.json"))
        .resources(
          http("request_48")
            .options("/configureAssistant")
            .headers(headers_3),
          http("request_49")
            .post("/configureAssistant")
            .headers(headers_4)
            .body(RawFileBody("game/playnewgametest/0049_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_50")
        .options("/save-session")
        .headers(headers_3)
        .resources(
          http("request_51")
            .post("/save-session")
            .headers(headers_9)
            .body(RawFileBody("game/playnewgametest/0051_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_52")
        .get("/get-sessions/pablo")
        .headers(headers_52)
    )

	setUp(scn.inject(constantUsersPerSec(3).during(15))).protocols(httpProtocol)
}
