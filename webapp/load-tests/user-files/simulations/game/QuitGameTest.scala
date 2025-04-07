package game

import scala.concurrent.duration._

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.jdbc.Predef._

class QuitGameTest extends Simulation {

  private val httpProtocol = http
    .baseUrl("http://localhost:8000")
    .inferHtmlResources()
    .acceptHeader("application/json, text/plain, */*")
    .acceptEncodingHeader("gzip, deflate")
    .acceptLanguageHeader("es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3")
    .userAgentHeader("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0")
  
  private val headers_0 = Map(
  		"Accept" -> "*/*",
  		"Access-Control-Request-Headers" -> "content-type",
  		"Access-Control-Request-Method" -> "POST",
  		"Origin" -> "http://localhost:3000",
  		"Priority" -> "u=4"
  )
  
  private val headers_1 = Map(
  		"Content-Type" -> "application/json",
  		"Origin" -> "http://localhost:3000",
  		"Priority" -> "u=0"
  )
  
  private val headers_3 = Map(
  		"Content-Type" -> "application/json",
  		"Origin" -> "http://localhost:3000"
  )
  
  private val headers_4 = Map(
  		"Accept" -> "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
  		"Priority" -> "u=5, i"
  )
  
  private val headers_5 = Map(
  		"Accept" -> "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
  		"Accept-Encoding" -> "gzip, deflate, br, zstd",
  		"Priority" -> "u=4, i",
  		"Sec-Fetch-Dest" -> "image",
  		"Sec-Fetch-Mode" -> "no-cors",
  		"Sec-Fetch-Site" -> "cross-site"
  )
  
  private val headers_10 = Map(
  		"If-None-Match" -> """W/"4-K+iMpCQsduglOsYkdIUQZQMtaDM"""",
  		"Origin" -> "http://localhost:3000"
  )
  
  private val headers_18 = Map(
  		"If-None-Match" -> """W/"e6-rTNEWRqeiCl5BI319/uEbXMu77s"""",
  		"Origin" -> "http://localhost:3000"
  )
  
  private val headers_25 = Map(
  		"If-None-Match" -> """W/"ef-DNb7VR6S1v9by/ILvL4KAse3TK0"""",
  		"Origin" -> "http://localhost:3000"
  )
  
  private val headers_30 = Map(
  		"If-None-Match" -> """W/"326-4SqStw1cNNsImvjivu9IBKgvbxQ"""",
  		"Origin" -> "http://localhost:3000",
  		"Priority" -> "u=0"
  )
  
  private val uri1 = "http://commons.wikimedia.org/wiki/Special:FilePath"
  
  private val uri3 = "https://upload.wikimedia.org/wikipedia/commons/a/a9/Beach_on_Upolu_Island%2C_Samoa%2C_2009.jpg"

  private val scn = scenario("QuitGameTest")
    .exec(
      http("request_0")
        .options("/startGame")
        .headers(headers_0)
        .resources(
          http("request_1")
            .post("/startGame")
            .headers(headers_1)
            .body(RawFileBody("game/quitgametest/0001_request.json")),
          http("request_2")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_3")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/quitgametest/0003_request.json")),
          http("request_4")
            .get(uri1 + "/Beach%20on%20Upolu%20Island%2C%20Samoa%2C%202009.jpg")
            .headers(headers_4),
          http("request_5")
            .get(uri3)
            .headers(headers_5),
          http("request_6")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/quitgametest/0006_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_7")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/quitgametest/0007_request.json"))
    )
    .pause(1)
    .exec(
      http("request_8")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/quitgametest/0008_request.json"))
        .resources(
          http("request_9")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/quitgametest/0009_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_10")
        .get("/nextQuestion?category=Geografia")
        .headers(headers_10)
        .resources(
          http("request_11")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_12")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/quitgametest/0012_request.json")),
          http("request_13")
            .get(uri1 + "/LocationGuinea.svg")
            .headers(headers_4),
          http("request_14")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/quitgametest/0014_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_15")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/quitgametest/0015_request.json"))
    )
    .pause(1)
    .exec(
      http("request_16")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/quitgametest/0016_request.json"))
        .resources(
          http("request_17")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/quitgametest/0017_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_18")
        .get("/nextQuestion?category=Geografia")
        .headers(headers_18)
        .resources(
          http("request_19")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_20")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/quitgametest/0020_request.json")),
          http("request_21")
            .get(uri1 + "/Luxemburg.jpg")
            .headers(headers_4),
          http("request_22")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/quitgametest/0022_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_23")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/quitgametest/0023_request.json"))
        .resources(
          http("request_24")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/quitgametest/0024_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_25")
        .get("/nextQuestion?category=Geografia")
        .headers(headers_25)
        .resources(
          http("request_26")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/quitgametest/0026_request.json")),
          http("request_27")
            .get(uri1 + "/MallaDistrict.jpg")
            .headers(headers_4),
          http("request_28")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_29")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/quitgametest/0029_request.json")),
          http("request_30")
            .get("/get-sessions/testing")
            .headers(headers_30)
        )
    )

	setUp(scn.inject(constantUsersPerSec(3).during(15))).protocols(httpProtocol)
}
