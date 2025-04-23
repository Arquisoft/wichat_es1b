package users3persec15s.game

import scala.concurrent.duration._

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.jdbc.Predef._

class NotFinishedGameTest extends Simulation {

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
  		"Origin" -> "http://localhost:8081",
  		"Priority" -> "u=4"
  )
  
  private val headers_1 = Map(
  		"Content-Type" -> "application/json",
  		"Origin" -> "http://localhost:8081",
  		"Priority" -> "u=0"
  )
  
  private val headers_3 = Map(
  		"Content-Type" -> "application/json",
  		"Origin" -> "http://localhost:8081"
  )
  
  private val headers_4 = Map(
  		"Accept" -> "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
  		"If-None-Match" -> """"c3b1ebe6153854d444e84413a913c69fe0604e40"""",
  		"Priority" -> "u=4, i"
  )
  
  private val headers_5 = Map(
  		"Accept" -> "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
  		"Priority" -> "u=5, i"
  )
  
  private val headers_8 = Map(
  		"Accept" -> "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
  		"Accept-Encoding" -> "gzip, deflate, br, zstd",
  		"Priority" -> "u=4, i",
  		"Sec-Fetch-Dest" -> "image",
  		"Sec-Fetch-Mode" -> "no-cors",
  		"Sec-Fetch-Site" -> "cross-site"
  )
  
  private val headers_13 = Map("Origin" -> "http://localhost:8081")
  
  private val headers_25 = Map(
  		"Accept" -> "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
  		"Accept-Encoding" -> "gzip, deflate, br, zstd",
  		"Priority" -> "u=5, i",
  		"Sec-Fetch-Dest" -> "image",
  		"Sec-Fetch-Mode" -> "no-cors",
  		"Sec-Fetch-Site" -> "cross-site"
  )
  
  private val headers_30 = Map(
  		"If-None-Match" -> """W/"ff-J9rauugehuyF1X+5QFTdXVQHU10"""",
  		"Origin" -> "http://localhost:8081"
  )
  
  private val headers_52 = Map(
  		"If-None-Match" -> """W/"101-QsZSRXTWB24XRpC4ABi2Xz47nEw"""",
  		"Origin" -> "http://localhost:8081"
  )
  
  private val headers_60 = Map(
  		"If-None-Match" -> """W/"10a-wZFtcY6Aatm183QRLz+UWIDqKlY"""",
  		"Origin" -> "http://localhost:8081"
  )
  
  private val headers_69 = Map(
  		"If-None-Match" -> """W/"6c8-6AeTM++FxITVd5B5b5beWWXmh8Y"""",
  		"Origin" -> "http://localhost:8081",
  		"Priority" -> "u=0"
  )
  
  private val headers_70 = Map(
  		"If-None-Match" -> """W/"76-UzWxL98qZUmbKVj/BMbHhe4JRu4"""",
  		"Origin" -> "http://localhost:8081",
  		"Priority" -> "u=0"
  )
  
  private val uri1 = "commons.wikimedia.org"
  
  private val uri2 = "localhost"
  
  private val uri3 = "https://upload.wikimedia.org/wikipedia/commons"

  private val scn = scenario("NotFinishedGameTest")
    .exec(
      http("request_0")
        .options("/startGame")
        .headers(headers_0)
        .resources(
          http("request_1")
            .post("/startGame")
            .headers(headers_1)
            .body(RawFileBody("game/notfinishedgametest/0001_request.json")),
          http("request_2")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_3")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/notfinishedgametest/0003_request.json")),
          http("request_4")
            .get("http://" + uri2 + ":8081/static/media/chat.0e3a868f28ca703feb02.png")
            .headers(headers_4),
          http("request_5")
            .get("http://" + uri1 + "/wiki/Special:FilePath/Soldat%20v1.7%20killed.png")
            .headers(headers_5),
          http("request_6")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/notfinishedgametest/0006_request.json")),
          http("request_7")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/notfinishedgametest/0007_request.json")),
          http("request_8")
            .get(uri3 + "/1/12/Soldat_v1.7_killed.png")
            .headers(headers_8),
          http("request_9")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/notfinishedgametest/0009_request.json")),
          http("request_10")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_11")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/notfinishedgametest/0011_request.json")),
          http("request_12")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/notfinishedgametest/0012_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_13")
        .get("/nextQuestion?category=Videojuegos")
        .headers(headers_13)
        .resources(
          http("request_14")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/notfinishedgametest/0014_request.json")),
          http("request_15")
            .get("http://" + uri1 + "/wiki/Special:FilePath/SierraOnLine-Box-SpaceQuest4.jpg")
            .headers(headers_5)
        )
    )
    .pause(1)
    .exec(
      http("request_16")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/notfinishedgametest/0016_request.json"))
    )
    .pause(1)
    .exec(
      http("request_17")
        .options("/configureAssistant")
        .headers(headers_0)
        .resources(
          http("request_18")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/notfinishedgametest/0018_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_19")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/notfinishedgametest/0019_request.json"))
    )
    .pause(1)
    .exec(
      http("request_20")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/notfinishedgametest/0020_request.json"))
    )
    .pause(1)
    .exec(
      http("request_21")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/notfinishedgametest/0021_request.json"))
    )
    .pause(1)
    .exec(
      http("request_22")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/notfinishedgametest/0022_request.json"))
        .resources(
          http("request_23")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_24")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/notfinishedgametest/0024_request.json")),
          http("request_25")
            .get(uri3 + "/2/28/SierraOnLine-Box-SpaceQuest4.jpg")
            .headers(headers_25),
          http("request_26")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/notfinishedgametest/0026_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_27")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/notfinishedgametest/0027_request.json"))
        .resources(
          http("request_28")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/notfinishedgametest/0028_request.json")),
          http("request_29")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/notfinishedgametest/0029_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_30")
        .get("/nextQuestion?category=Videojuegos")
        .headers(headers_30)
        .resources(
          http("request_31")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_32")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/notfinishedgametest/0032_request.json")),
          http("request_33")
            .get("http://" + uri1 + "/wiki/Special:FilePath/Ducktales%20cartridge.jpg")
            .headers(headers_5),
          http("request_34")
            .get("https://" + uri1 + "/wiki/Special:FilePath/Ducktales_cartridge.jpg")
            .headers(headers_25),
          http("request_35")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/notfinishedgametest/0035_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_36")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/notfinishedgametest/0036_request.json"))
    )
    .pause(1)
    .exec(
      http("request_37")
        .options("/configureAssistant")
        .headers(headers_0)
        .resources(
          http("request_38")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/notfinishedgametest/0038_request.json"))
        )
    )
    .pause(1000.milliseconds)
    .exec(
      http("request_39")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/notfinishedgametest/0039_request.json"))
        .resources(
          http("request_40")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/notfinishedgametest/0040_request.json")),
          http("request_41")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/notfinishedgametest/0041_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_42")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/notfinishedgametest/0042_request.json"))
        .resources(
          http("request_43")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_44")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/notfinishedgametest/0044_request.json")),
          http("request_45")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/notfinishedgametest/0045_request.json")),
          http("request_46")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/notfinishedgametest/0046_request.json")),
          http("request_47")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/notfinishedgametest/0047_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_48")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/notfinishedgametest/0048_request.json"))
        .resources(
          http("request_49")
            .get(uri3 + "/7/7f/Ducktales_cartridge.jpg")
            .headers(headers_25),
          http("request_50")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_51")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/notfinishedgametest/0051_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_52")
        .get("/nextQuestion?category=Videojuegos")
        .headers(headers_52)
        .resources(
          http("request_53")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/notfinishedgametest/0053_request.json")),
          http("request_54")
            .get("http://" + uri1 + "/wiki/Special:FilePath/Frozen%20Bubble%202%20-%20Single%20player.png")
            .headers(headers_5),
          http("request_55")
            .get(uri3 + "/3/34/Frozen_Bubble_2_-_Single_player.png")
            .headers(headers_25),
          http("request_56")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/notfinishedgametest/0056_request.json")),
          http("request_57")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_58")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/notfinishedgametest/0058_request.json")),
          http("request_59")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/notfinishedgametest/0059_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_60")
        .get("/nextQuestion?category=Videojuegos")
        .headers(headers_60)
        .resources(
          http("request_61")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/notfinishedgametest/0061_request.json")),
          http("request_62")
            .get("http://" + uri1 + "/wiki/Special:FilePath/Openttd%20transport%20tycoon-terabass.jpg")
            .headers(headers_5)
        )
    )
    .pause(1000.milliseconds)
    .exec(
      http("request_63")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/notfinishedgametest/0063_request.json"))
        .resources(
          http("request_64")
            .get(uri3 + "/6/60/Openttd_transport_tycoon-terabass.jpg")
            .headers(headers_25),
          http("request_65")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_66")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/notfinishedgametest/0066_request.json")),
          http("request_67")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/notfinishedgametest/0067_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_68")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/notfinishedgametest/0068_request.json"))
        .resources(
          http("request_69")
            .get("/get-user-sessions/gatling")
            .headers(headers_69),
          http("request_70")
            .get("/get-users-totaldatas")
            .headers(headers_70)
        )
    )

	setUp(scn.inject(constantUsersPerSec(3).during(15))).protocols(httpProtocol)
}
