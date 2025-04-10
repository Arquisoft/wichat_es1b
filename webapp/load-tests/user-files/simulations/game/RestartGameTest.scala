package game

import scala.concurrent.duration._

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.jdbc.Predef._

class RestartGameTest extends Simulation {

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
  		"If-None-Match" -> """"c3b1ebe6153854d444e84413a913c69fe0604e40"""",
  		"Priority" -> "u=4, i"
  )
  
  private val headers_5 = Map(
  		"Accept" -> "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
  		"Priority" -> "u=5, i"
  )
  
  private val headers_6 = Map(
  		"Accept" -> "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
  		"Accept-Encoding" -> "gzip, deflate, br, zstd",
  		"Priority" -> "u=4, i",
  		"Sec-Fetch-Dest" -> "image",
  		"Sec-Fetch-Mode" -> "no-cors",
  		"Sec-Fetch-Site" -> "cross-site"
  )
  
  private val headers_11 = Map("Origin" -> "http://localhost:3000")
  
  private val headers_20 = Map(
  		"If-None-Match" -> """W/"11f-tHv0gMvgBf28P3C21281nlfrAm8"""",
  		"Origin" -> "http://localhost:3000"
  )
  
  private val headers_28 = Map(
  		"If-None-Match" -> """W/"150-4pp/5idPD0qYiXFLlCXGiDcV1O8"""",
  		"Origin" -> "http://localhost:3000"
  )
  
  private val headers_35 = Map(
  		"If-None-Match" -> """W/"109-yMKHqUitkd97OeZRRQw8FDTlbN4"""",
  		"Origin" -> "http://localhost:3000"
  )
  
  private val headers_52 = Map(
  		"If-None-Match" -> """W/"106-AYLC/P0lDCzR6ocTF1JjePpMv/A"""",
  		"Origin" -> "http://localhost:3000"
  )
  
  private val headers_59 = Map(
  		"If-None-Match" -> """W/"f9-LfJKlPkOsKGL0PMgjmfHCV6TJ5M"""",
  		"Origin" -> "http://localhost:3000"
  )
  
  private val headers_62 = Map(
  		"Accept" -> "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
  		"Accept-Encoding" -> "gzip, deflate, br, zstd",
  		"Priority" -> "u=5, i",
  		"Sec-Fetch-Dest" -> "image",
  		"Sec-Fetch-Mode" -> "no-cors",
  		"Sec-Fetch-Site" -> "cross-site"
  )
  
  private val headers_67 = Map(
  		"If-None-Match" -> """W/"11c-F2N8+OnJsy5LFr2qMeBpRMmX69Y"""",
  		"Origin" -> "http://localhost:3000"
  )
  
  private val headers_72 = Map(
  		"If-None-Match" -> """W/"105-s9gsl+2PqrSJkm2ir07BxakruiQ"""",
  		"Origin" -> "http://localhost:3000"
  )
  
  private val headers_82 = Map(
  		"If-None-Match" -> """W/"2-l9Fw4VUO7kr8CvBlt4zaMCqXZ0w"""",
  		"Origin" -> "http://localhost:3000",
  		"Priority" -> "u=0"
  )
  
  private val uri1 = "http://commons.wikimedia.org/wiki/Special:FilePath"
  
  private val uri2 = "localhost"
  
  private val uri3 = "https://upload.wikimedia.org/wikipedia/commons"

  private val scn = scenario("RestartGameTest")
    .exec(
      http("request_0")
        .options("/startGame")
        .headers(headers_0)
        .resources(
          http("request_1")
            .post("/startGame")
            .headers(headers_1)
            .body(RawFileBody("game/restartgametest/0001_request.json")),
          http("request_2")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_3")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0003_request.json")),
          http("request_4")
            .get("http://" + uri2 + ":3000/static/media/chat.0e3a868f28ca703feb02.png")
            .headers(headers_4),
          http("request_5")
            .get(uri1 + "/Salmanrampwalk.png")
            .headers(headers_5),
          http("request_6")
            .get(uri3 + "/d/dd/Salmanrampwalk.png")
            .headers(headers_6),
          http("request_7")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0007_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_8")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/restartgametest/0008_request.json"))
    )
    .pause(1)
    .exec(
      http("request_9")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/restartgametest/0009_request.json"))
        .resources(
          http("request_10")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/restartgametest/0010_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_11")
        .get("/nextQuestion?category=Personajes")
        .headers(headers_11)
        .resources(
          http("request_12")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_13")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0013_request.json")),
          http("request_14")
            .get(uri1 + "/Orson%20Welles%201937%20cr3-4.jpg")
            .headers(headers_5),
          http("request_15")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0015_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_16")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/restartgametest/0016_request.json"))
    )
    .pause(1)
    .exec(
      http("request_17")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/restartgametest/0017_request.json"))
    )
    .pause(1)
    .exec(
      http("request_18")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/restartgametest/0018_request.json"))
        .resources(
          http("request_19")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/restartgametest/0019_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_20")
        .get("/nextQuestion?category=Personajes")
        .headers(headers_20)
        .resources(
          http("request_21")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_22")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0022_request.json")),
          http("request_23")
            .get(uri1 + "/Captain%20Marvel%20trailer%20at%20the%20National%20Air%20and%20Space%20Museum%204%20%28cropped%29.jpg")
            .headers(headers_5),
          http("request_24")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0024_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_25")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/restartgametest/0025_request.json"))
    )
    .pause(1)
    .exec(
      http("request_26")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/restartgametest/0026_request.json"))
        .resources(
          http("request_27")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/restartgametest/0027_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_28")
        .get("/nextQuestion?category=Personajes")
        .headers(headers_28)
        .resources(
          http("request_29")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_30")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0030_request.json")),
          http("request_31")
            .get(uri1 + "/TakeshiKitano.jpg")
            .headers(headers_5),
          http("request_32")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0032_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_33")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/restartgametest/0033_request.json"))
        .resources(
          http("request_34")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/restartgametest/0034_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_35")
        .get("/nextQuestion?category=Personajes")
        .headers(headers_35)
        .resources(
          http("request_36")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0036_request.json")),
          http("request_37")
            .get(uri1 + "/TR%20Knight%20cropped.jpg")
            .headers(headers_5),
          http("request_38")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_39")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0039_request.json")),
          http("request_40")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0040_request.json")),
          http("request_41")
            .options("/startGame")
            .headers(headers_0),
          http("request_42")
            .post("/startGame")
            .headers(headers_1)
            .body(RawFileBody("game/restartgametest/0042_request.json")),
          http("request_43")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0043_request.json")),
          http("request_44")
            .get(uri1 + "/Valery%20Leontiev%20at%20Laima%20Rendez%20Vous%20Jurmala%202017%20%282%29%20%28cropped%29.jpg")
            .headers(headers_5),
          http("request_45")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0045_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_46")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/restartgametest/0046_request.json"))
    )
    .pause(1)
    .exec(
      http("request_47")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/restartgametest/0047_request.json"))
        .resources(
          http("request_48")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_49")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0049_request.json")),
          http("request_50")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0050_request.json")),
          http("request_51")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/restartgametest/0051_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_52")
        .get("/nextQuestion?category=Personajes")
        .headers(headers_52)
        .resources(
          http("request_53")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0053_request.json")),
          http("request_54")
            .get(uri1 + "/Aaliyah-02.jpg")
            .headers(headers_5),
          http("request_55")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0055_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_56")
        .options("/configureAssistant")
        .headers(headers_0)
        .resources(
          http("request_57")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0057_request.json")),
          http("request_58")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/restartgametest/0058_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_59")
        .get("/nextQuestion?category=Personajes")
        .headers(headers_59)
        .resources(
          http("request_60")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0060_request.json")),
          http("request_61")
            .get(uri1 + "/Brenda%20Strong%20at%20PaleyFest%202013.jpg")
            .headers(headers_5),
          http("request_62")
            .get(uri3 + "/6/64/Brenda_Strong_at_PaleyFest_2013.jpg")
            .headers(headers_62),
          http("request_63")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0063_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_64")
        .options("/configureAssistant")
        .headers(headers_0)
        .resources(
          http("request_65")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0065_request.json")),
          http("request_66")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/restartgametest/0066_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_67")
        .get("/nextQuestion?category=Personajes")
        .headers(headers_67)
        .resources(
          http("request_68")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0068_request.json")),
          http("request_69")
            .get(uri1 + "/Maria%20Kulle%20%28cropped%29.jpg")
            .headers(headers_5),
          http("request_70")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0070_request.json")),
          http("request_71")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/restartgametest/0071_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_72")
        .get("/nextQuestion?category=Personajes")
        .headers(headers_72)
        .resources(
          http("request_73")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_74")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0074_request.json")),
          http("request_75")
            .get(uri1 + "/Eric%20Stuart%20by%20Gage%20Skidmore.jpg")
            .headers(headers_5),
          http("request_76")
            .get(uri3 + "/2/2d/Eric_Stuart_by_Gage_Skidmore.jpg")
            .headers(headers_62),
          http("request_77")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0077_request.json")),
          http("request_78")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0078_request.json")),
          http("request_79")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/restartgametest/0079_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_80")
        .options("/save-session")
        .headers(headers_0)
        .resources(
          http("request_81")
            .post("/save-session")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0081_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_82")
        .get("/get-sessions/testing")
        .headers(headers_82)
    )

	setUp(scn.inject(constantUsersPerSec(3).during(15))).protocols(httpProtocol)
}
