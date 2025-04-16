package users3persec15s.game

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
  		"Priority" -> "u=4, i"
  )
  
  private val headers_7 = Map("Origin" -> "http://localhost:8081")
  
  private val headers_9 = Map(
  		"Accept" -> "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
  		"Priority" -> "u=5, i"
  )
  
  private val headers_10 = Map(
  		"Accept" -> "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
  		"Accept-Encoding" -> "gzip, deflate, br, zstd",
  		"Priority" -> "u=5, i",
  		"Sec-Fetch-Dest" -> "image",
  		"Sec-Fetch-Mode" -> "no-cors",
  		"Sec-Fetch-Site" -> "cross-site"
  )
  
  private val headers_14 = Map(
  		"If-None-Match" -> """W/"113-rUJME/hSbNLJ6nt1i3+TL1sa4Jg"""",
  		"Origin" -> "http://localhost:8081"
  )
  
  private val headers_24 = Map(
  		"If-None-Match" -> """W/"106-7yijGRiwR8Mfgs0FzrtsBlns0R4"""",
  		"Origin" -> "http://localhost:8081"
  )
  
  private val headers_31 = Map(
  		"If-None-Match" -> """W/"117-oMpENu/6JLbHbsGdiwrdRXAj+vA"""",
  		"Origin" -> "http://localhost:8081"
  )
  
  private val headers_37 = Map(
  		"If-None-Match" -> """W/"13d-He/HNDnWseeOqTh/VbG0sQBSVHc"""",
  		"Origin" -> "http://localhost:8081"
  )
  
  private val headers_44 = Map(
  		"Accept" -> "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
  		"Accept-Encoding" -> "gzip, deflate, br, zstd",
  		"Priority" -> "u=4, i",
  		"Sec-Fetch-Dest" -> "image",
  		"Sec-Fetch-Mode" -> "no-cors",
  		"Sec-Fetch-Site" -> "cross-site"
  )
  
  private val headers_52 = Map(
  		"If-None-Match" -> """W/"107-903H450jF2N9ml196PktZP8I2rM"""",
  		"Origin" -> "http://localhost:8081"
  )
  
  private val headers_57 = Map(
  		"If-None-Match" -> """W/"107-c0RGWk0vCEf+kHqCJVKgOnAP+RQ"""",
  		"Origin" -> "http://localhost:8081"
  )
  
  private val headers_63 = Map(
  		"If-None-Match" -> """W/"11e-n2d3XsSrCzjC/8YU9XxrKtc6s2A"""",
  		"Origin" -> "http://localhost:8081"
  )
  
  private val headers_70 = Map(
  		"If-None-Match" -> """W/"14e-xY+BltKHkV17RlYUXuyMQjSqXys"""",
  		"Origin" -> "http://localhost:8081"
  )
  
  private val headers_78 = Map(
  		"If-None-Match" -> """W/"110-B7Ogx0W18lhzWXE9S73dJjDTj+o"""",
  		"Origin" -> "http://localhost:8081"
  )
  
  private val headers_88 = Map(
  		"If-None-Match" -> """W/"10a-d+HOKYWV50DQAuekoNvfh5rtcmE"""",
  		"Origin" -> "http://localhost:8081"
  )
  
  private val headers_100 = Map(
  		"If-None-Match" -> """W/"12d-UKGPTqHtpoZXCZYmQ3V4LfxXDuE"""",
  		"Origin" -> "http://localhost:8081"
  )
  
  private val headers_108 = Map(
  		"If-None-Match" -> """W/"147-D5EbgmycSDDiL5Z4xdJq7MUq+Sk"""",
  		"Origin" -> "http://localhost:8081"
  )
  
  private val headers_115 = Map(
  		"If-None-Match" -> """W/"10c-6SFliPcfhpOV8pYrCCb67bE8cbs"""",
  		"Origin" -> "http://localhost:8081"
  )
  
  private val headers_126 = Map(
  		"If-None-Match" -> """W/"cfe-JaH8eOaFtY2sBUwewmsFrH1skyk"""",
  		"Origin" -> "http://localhost:8081",
  		"Priority" -> "u=0"
  )
  
  private val headers_127 = Map(
  		"If-None-Match" -> """W/"77-SIUdqiHxgI8jiHz+/QWQkowwk6o"""",
  		"Origin" -> "http://localhost:8081",
  		"Priority" -> "u=0"
  )
  
  private val uri1 = "commons.wikimedia.org"
  
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
            .get("http://" + uri1 + "/wiki/Special:FilePath/F-14A%20Tomcat%20over%20Iraq%20during%20Southern%20Watch.jpg")
            .headers(headers_4),
          http("request_5")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0005_request.json")),
          http("request_6")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/restartgametest/0006_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_7")
        .get("/nextQuestion?category=Aviones")
        .headers(headers_7)
        .resources(
          http("request_8")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0008_request.json")),
          http("request_9")
            .get("http://" + uri1 + "/wiki/Special:FilePath/Delta%20Air%20Lines%20B767-332%20N130DL.jpg")
            .headers(headers_9),
          http("request_10")
            .get(uri3 + "/4/43/Delta_Air_Lines_B767-332_N130DL.jpg")
            .headers(headers_10),
          http("request_11")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_12")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0012_request.json")),
          http("request_13")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/restartgametest/0013_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_14")
        .get("/nextQuestion?category=Aviones")
        .headers(headers_14)
        .resources(
          http("request_15")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0015_request.json")),
          http("request_16")
            .get("http://" + uri1 + "/wiki/Special:FilePath/Aviogenex%20b737-200%20yu-anp%20arp.jpg")
            .headers(headers_9),
          http("request_17")
            .get(uri3 + "/d/d9/Aviogenex_b737-200_yu-anp_arp.jpg")
            .headers(headers_10),
          http("request_18")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0018_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_19")
        .options("/configureAssistant")
        .headers(headers_0)
        .resources(
          http("request_20")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0020_request.json")),
          http("request_21")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0021_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_22")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/restartgametest/0022_request.json"))
        .resources(
          http("request_23")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/restartgametest/0023_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_24")
        .get("/nextQuestion?category=Aviones")
        .headers(headers_24)
        .resources(
          http("request_25")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_26")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0026_request.json")),
          http("request_27")
            .get("http://" + uri1 + "/wiki/Special:FilePath/SNC-1%20in%20flight%20off%20Puerto%20Rico%201943.jpeg")
            .headers(headers_9),
          http("request_28")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0028_request.json")),
          http("request_29")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0029_request.json")),
          http("request_30")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/restartgametest/0030_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_31")
        .get("/nextQuestion?category=Aviones")
        .headers(headers_31)
        .resources(
          http("request_32")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0032_request.json")),
          http("request_33")
            .get("http://" + uri1 + "/wiki/Special:FilePath/Ilyushin%20IL-76MD%20-%20Ukrainian%20Air%20Force%20-%2076683%20%2848367735331%20cropped%29.jpg")
            .headers(headers_9),
          http("request_34")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0034_request.json")),
          http("request_35")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/restartgametest/0035_request.json")),
          http("request_36")
            .get(uri3 + "/7/7e/Ilyushin_IL-76MD_-_Ukrainian_Air_Force_-_76683_%2848367735331_cropped%29.jpg")
            .headers(headers_10),
          http("request_37")
            .get("/nextQuestion?category=Aviones")
            .headers(headers_37),
          http("request_38")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0038_request.json")),
          http("request_39")
            .get("http://" + uri1 + "/wiki/Special:FilePath/Aidc-t-ch-1.jpg")
            .headers(headers_9),
          http("request_40")
            .options("/startGame")
            .headers(headers_0),
          http("request_41")
            .post("/startGame")
            .headers(headers_1)
            .body(RawFileBody("game/restartgametest/0041_request.json")),
          http("request_42")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0042_request.json")),
          http("request_43")
            .get("http://" + uri1 + "/wiki/Special:FilePath/Virgin%20Atlantic%20Airbus%20A350-1041XWB%20G-VLUX%20%28Red%20Velvet%29%20approaching%20JFK%20Airport.jpg")
            .headers(headers_4),
          http("request_44")
            .get("https://" + uri1 + "/wiki/Special:FilePath/Virgin%20Atlantic%20Airbus%20A350-1041XWB%20G-VLUX%20%28Red%20Velvet%29%20approaching%20JFK%20Airport.jpg")
            .headers(headers_44),
          http("request_45")
            .get(uri3 + "/f/f2/Virgin_Atlantic_Airbus_A350-1041XWB_G-VLUX_%28Red_Velvet%29_approaching_JFK_Airport.jpg")
            .headers(headers_44),
          http("request_46")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_47")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0047_request.json")),
          http("request_48")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0048_request.json")),
          http("request_49")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0049_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_50")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/restartgametest/0050_request.json"))
        .resources(
          http("request_51")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/restartgametest/0051_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_52")
        .get("/nextQuestion?category=Aviones")
        .headers(headers_52)
        .resources(
          http("request_53")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_54")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0054_request.json")),
          http("request_55")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0055_request.json")),
          http("request_56")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/restartgametest/0056_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_57")
        .get("/nextQuestion?category=Aviones")
        .headers(headers_57)
        .resources(
          http("request_58")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0058_request.json")),
          http("request_59")
            .get("http://" + uri1 + "/wiki/Special:FilePath/BAC%20111-479FU%20One-Eleven%2C%20UK%20-%20Air%20Force%20AN0940866.jpg")
            .headers(headers_9),
          http("request_60")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_61")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0061_request.json")),
          http("request_62")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/restartgametest/0062_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_63")
        .get("/nextQuestion?category=Aviones")
        .headers(headers_63)
        .resources(
          http("request_64")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0064_request.json")),
          http("request_65")
            .get("http://" + uri1 + "/wiki/Special:FilePath/English%20Electric%20Lightning%20F6%2C%20UK%20-%20Air%20Force%20AN2260192.jpg")
            .headers(headers_9),
          http("request_66")
            .get("https://" + uri1 + "/wiki/Special:FilePath/English_Electric_Lightning_F6,_UK_-_Air_Force_AN2260192.jpg")
            .headers(headers_10),
          http("request_67")
            .get(uri3 + "/b/b1/English_Electric_Lightning_F6%2C_UK_-_Air_Force_AN2260192.jpg")
            .headers(headers_10),
          http("request_68")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0068_request.json")),
          http("request_69")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/restartgametest/0069_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_70")
        .get("/nextQuestion?category=Aviones")
        .headers(headers_70)
        .resources(
          http("request_71")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0071_request.json")),
          http("request_72")
            .get("http://" + uri1 + "/wiki/Special:FilePath/C-FSJJ%20%2843123199145%29.jpg")
            .headers(headers_9),
          http("request_73")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0073_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_74")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/restartgametest/0074_request.json"))
    )
    .pause(1)
    .exec(
      http("request_75")
        .options("/configureAssistant")
        .headers(headers_0)
        .resources(
          http("request_76")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0076_request.json")),
          http("request_77")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/restartgametest/0077_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_78")
        .get("/nextQuestion?category=Aviones")
        .headers(headers_78)
        .resources(
          http("request_79")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0079_request.json")),
          http("request_80")
            .get("http://" + uri1 + "/wiki/Special:FilePath/Buecker%20133C%20Jungmeister%202.jpg")
            .headers(headers_9),
          http("request_81")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0081_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_82")
        .options("/configureAssistant")
        .headers(headers_0)
        .resources(
          http("request_83")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0083_request.json")),
          http("request_84")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0084_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_85")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/restartgametest/0085_request.json"))
        .resources(
          http("request_86")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0086_request.json")),
          http("request_87")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/restartgametest/0087_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_88")
        .get("/nextQuestion?category=Aviones")
        .headers(headers_88)
        .resources(
          http("request_89")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_90")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0090_request.json")),
          http("request_91")
            .get("http://" + uri1 + "/wiki/Special:FilePath/EGSU%20-%20FIAT%20CR42%20Falco%20-%20MM6976%20%2842145265190%29.jpg")
            .headers(headers_9),
          http("request_92")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0092_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_93")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/restartgametest/0093_request.json"))
    )
    .pause(1)
    .exec(
      http("request_94")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/restartgametest/0094_request.json"))
    )
    .pause(1)
    .exec(
      http("request_95")
        .options("/configureAssistant")
        .headers(headers_0)
        .resources(
          http("request_96")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0096_request.json")),
          http("request_97")
            .get(uri3 + "/9/91/EGSU_-_FIAT_CR42_Falco_-_MM6976_%2842145265190%29.jpg")
            .headers(headers_10),
          http("request_98")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0098_request.json")),
          http("request_99")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/restartgametest/0099_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_100")
        .get("/nextQuestion?category=Aviones")
        .headers(headers_100)
        .resources(
          http("request_101")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0101_request.json")),
          http("request_102")
            .get("http://" + uri1 + "/wiki/Special:FilePath/Curtiss%20XP-60C%20in%20flight%2C%20modified%20from%20second%20XP-60A.%20061024-F-1234P-018.jpg")
            .headers(headers_9),
          http("request_103")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0103_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_104")
        .options("/configureAssistant")
        .headers(headers_0)
        .resources(
          http("request_105")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0105_request.json")),
          http("request_106")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0106_request.json")),
          http("request_107")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/restartgametest/0107_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_108")
        .get("/nextQuestion?category=Aviones")
        .headers(headers_108)
        .resources(
          http("request_109")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0109_request.json")),
          http("request_110")
            .get("http://" + uri1 + "/wiki/Special:FilePath/Lao%20Aviation%20Xian%20Y-7-100C%20Bor.jpg")
            .headers(headers_9),
          http("request_111")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0111_request.json")),
          http("request_112")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_113")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0113_request.json")),
          http("request_114")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/restartgametest/0114_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_115")
        .get("/nextQuestion?category=Aviones")
        .headers(headers_115)
        .resources(
          http("request_116")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0116_request.json")),
          http("request_117")
            .get("http://" + uri1 + "/wiki/Special:FilePath/100820%20Speyer%20Museum%20%2817%29.jpg")
            .headers(headers_9),
          http("request_118")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0118_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_119")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/restartgametest/0119_request.json"))
    )
    .pause(1)
    .exec(
      http("request_120")
        .options("/configureAssistant")
        .headers(headers_0)
        .resources(
          http("request_121")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0121_request.json")),
          http("request_122")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0122_request.json")),
          http("request_123")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/restartgametest/0123_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_124")
        .options("/save-session")
        .headers(headers_0)
        .resources(
          http("request_125")
            .post("/save-session")
            .headers(headers_3)
            .body(RawFileBody("game/restartgametest/0125_request.json"))
        )
    )
    .pause(3)
    .exec(
      http("request_126")
        .get("/get-user-sessions/gatling")
        .headers(headers_126)
        .resources(
          http("request_127")
            .get("/get-users-totaldatas")
            .headers(headers_127)
        )
    )

	setUp(scn.inject(constantUsersPerSec(3).during(15))).protocols(httpProtocol)
}
