package game

import scala.concurrent.duration._

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.jdbc.Predef._

class PlayNewGameUsingLLMTest extends Simulation {

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
  
  private val headers_2 = Map(
  		"If-None-Match" -> """W/"9124-kQqqTiFHhtH6zE9cpM3h0HcVQ/M"""",
  		"Origin" -> "http://localhost:3000"
  )
  
  private val headers_6 = Map(
  		"Content-Type" -> "application/json",
  		"Origin" -> "http://localhost:3000"
  )
  
  private val headers_7 = Map(
  		"Accept" -> "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
  		"If-None-Match" -> """"c3b1ebe6153854d444e84413a913c69fe0604e40"""",
  		"Priority" -> "u=4, i"
  )
  
  private val headers_8 = Map(
  		"Accept" -> "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
  		"Priority" -> "u=5, i"
  )
  
  private val headers_9 = Map(
  		"Accept" -> "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
  		"Accept-Encoding" -> "gzip, deflate, br, zstd",
  		"Priority" -> "u=4, i",
  		"Sec-Fetch-Dest" -> "image",
  		"Sec-Fetch-Mode" -> "no-cors",
  		"Sec-Fetch-Site" -> "cross-site"
  )
  
  private val headers_13 = Map(
  		"If-None-Match" -> """W/"11c-yaCnKpemTb8keVx/Oj85VLGf77w"""",
  		"Origin" -> "http://localhost:3000"
  )
  
  private val headers_40 = Map(
  		"If-None-Match" -> """W/"f4-gIeQ25mpV2V86zdcuSwwdXNCzBs"""",
  		"Origin" -> "http://localhost:3000"
  )
  
  private val headers_61 = Map(
  		"If-None-Match" -> """W/"11a-RE5OJ+4b0y25rC0GxcW4yGNIJH4"""",
  		"Origin" -> "http://localhost:3000"
  )
  
  private val headers_63 = Map(
  		"Accept" -> "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
  		"Accept-Encoding" -> "gzip, deflate, br, zstd",
  		"Priority" -> "u=5, i",
  		"Sec-Fetch-Dest" -> "image",
  		"Sec-Fetch-Mode" -> "no-cors",
  		"Sec-Fetch-Site" -> "cross-site"
  )
  
  private val headers_82 = Map(
  		"If-None-Match" -> """W/"ea-c/OwjFlJhrmyArSTvHZ2P1CFDpM"""",
  		"Origin" -> "http://localhost:3000"
  )
  
  private val headers_119 = Map(
  		"If-None-Match" -> """W/"11c02-u6u7DNDpTyZ2CD/64Kab5q58Qv0"""",
  		"Origin" -> "http://localhost:3000",
  		"Priority" -> "u=0"
  )
  
  private val uri1 = "commons.wikimedia.org"
  
  private val uri2 = "localhost"

  private val chain_0 =
    exec(
      http("request_0")
        .options("/login")
        .headers(headers_0)
        .resources(
          http("request_1")
            .post("/login")
            .headers(headers_1)
            .body(RawFileBody("game/playnewgameusingllmtest/0001_request.json")),
          http("request_2")
            .get("/get-sessions/pablo")
            .headers(headers_2)
        )
    )
    .pause(4)
    .exec(
      http("request_3")
        .options("/startGame")
        .headers(headers_0)
        .resources(
          http("request_4")
            .post("/startGame")
            .headers(headers_1)
            .body(RawFileBody("game/playnewgameusingllmtest/0004_request.json")),
          http("request_5")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_6")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0006_request.json")),
          http("request_7")
            .get("http://" + uri2 + ":3000/static/media/chat.0e3a868f28ca703feb02.png")
            .headers(headers_7),
          http("request_8")
            .get("http://" + uri1 + "/wiki/Special:FilePath/An%20aerial%20view%20of%20Djibouti%20City.jpg")
            .headers(headers_8),
          http("request_9")
            .get("https://" + uri1 + "/wiki/Special:FilePath/An%20aerial%20view%20of%20Djibouti%20City.jpg")
            .headers(headers_9),
          http("request_10")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0010_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_11")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0011_request.json"))
        .resources(
          http("request_12")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/playnewgameusingllmtest/0012_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_13")
        .get("/nextQuestion?category=Geografia")
        .headers(headers_13)
        .resources(
          http("request_14")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_15")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0015_request.json")),
          http("request_16")
            .get("http://" + uri1 + "/wiki/Special:FilePath/T%C3%B6%C3%B6l%C3%B6nlahti1.jpg")
            .headers(headers_8),
          http("request_17")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0017_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_18")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0018_request.json"))
        .resources(
          http("request_19")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0019_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_20")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0020_request.json"))
    )
    .pause(1)
    .exec(
      http("request_21")
        .options("/configureAssistant")
        .headers(headers_0)
        .resources(
          http("request_22")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0022_request.json")),
          http("request_23")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0023_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_24")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0024_request.json"))
    )
    .pause(1)
    .exec(
      http("request_25")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0025_request.json"))
    )
    .pause(1)
    .exec(
      http("request_26")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0026_request.json"))
        .resources(
          http("request_27")
            .options("/askllm")
            .headers(headers_0),
          http("request_28")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_29")
            .post("/askllm")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0029_request.json")),
          http("request_30")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0030_request.json")),
          http("request_31")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0031_request.json")),
          http("request_32")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0032_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_33")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0033_request.json"))
    )
    .pause(1)
    .exec(
      http("request_34")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0034_request.json"))
    )
    .pause(1)
    .exec(
      http("request_35")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0035_request.json"))
    )
    .pause(1)
    .exec(
      http("request_36")
        .options("/configureAssistant")
        .headers(headers_0)
        .resources(
          http("request_37")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0037_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_38")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0038_request.json"))
        .resources(
          http("request_39")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/playnewgameusingllmtest/0039_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_40")
        .get("/nextQuestion?category=Geografia")
        .headers(headers_40)
        .resources(
          http("request_41")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0041_request.json")),
          http("request_42")
            .get("http://" + uri1 + "/wiki/Special:FilePath/Mozambique%20-%20Location%20Map%20%282013%29%20-%20MOZ%20-%20UNOCHA.svg")
            .headers(headers_8),
          http("request_43")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0043_request.json")),
          http("request_44")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_45")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0045_request.json")),
          http("request_46")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0046_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_47")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0047_request.json"))
    )
    .pause(1)
    .exec(
      http("request_48")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0048_request.json"))
    )
    .pause(1)
    .exec(
      http("request_49")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0049_request.json"))
    )
    .pause(1)
    .exec(
      http("request_50")
        .options("/configureAssistant")
        .headers(headers_0)
        .resources(
          http("request_51")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0051_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_52")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0052_request.json"))
    )
    .pause(1)
    .exec(
      http("request_53")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0053_request.json"))
    )
    .pause(1)
    .exec(
      http("request_54")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0054_request.json"))
        .resources(
          http("request_55")
            .options("/askllm")
            .headers(headers_0),
          http("request_56")
            .post("/askllm")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0056_request.json")),
          http("request_57")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0057_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_58")
        .options("/configureAssistant")
        .headers(headers_0)
        .resources(
          http("request_59")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0059_request.json")),
          http("request_60")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/playnewgameusingllmtest/0060_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_61")
        .get("/nextQuestion?category=Geografia")
        .headers(headers_61)
        .resources(
          http("request_62")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0062_request.json")),
          http("request_63")
            .get("https://" + uri1 + "/wiki/Special:FilePath/Cidade%20Maravilhosa.jpg")
            .headers(headers_63),
          http("request_64")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0064_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_65")
        .options("/configureAssistant")
        .headers(headers_0)
        .resources(
          http("request_66")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0066_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_67")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0067_request.json"))
    )
    .pause(1)
    .exec(
      http("request_68")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0068_request.json"))
    )
    .pause(1)
    .exec(
      http("request_69")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0069_request.json"))
    )
    .pause(1)
    .exec(
      http("request_70")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0070_request.json"))
    )
    .pause(1)
    .exec(
      http("request_71")
        .options("/configureAssistant")
        .headers(headers_0)
        .resources(
          http("request_72")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0072_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_73")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0073_request.json"))
    )
    .pause(1)
    .exec(
      http("request_74")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0074_request.json"))
    )
    .pause(1)
    .exec(
      http("request_75")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0075_request.json"))
    )
    .pause(1)
    .exec(
      http("request_76")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0076_request.json"))
        .resources(
          http("request_77")
            .options("/askllm")
            .headers(headers_0),
          http("request_78")
            .post("/askllm")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0078_request.json")),
          http("request_79")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_80")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0080_request.json")),
          http("request_81")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/playnewgameusingllmtest/0081_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_82")
        .get("/nextQuestion?category=Geografia")
        .headers(headers_82)
        .resources(
          http("request_83")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0083_request.json")),
          http("request_84")
            .get("http://" + uri1 + "/wiki/Special:FilePath/Lospalos%20klein.jpg")
            .headers(headers_8),
          http("request_85")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0085_request.json")),
          http("request_86")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0086_request.json"))
        )
    )
    .pause(1000.milliseconds)
    .exec(
      http("request_87")
        .options("/configureAssistant")
        .headers(headers_0)
        .resources(
          http("request_88")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0088_request.json")),
          http("request_89")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0089_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_90")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0090_request.json"))
    )
    .pause(1)
    .exec(
      http("request_91")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0091_request.json"))
    )
    .pause(1)
    .exec(
      http("request_92")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0092_request.json"))
    )
    .pause(1)
    .exec(
      http("request_93")
        .options("/configureAssistant")
        .headers(headers_0)
        .resources(
          http("request_94")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0094_request.json")),
          http("request_95")
            .options("/askllm")
            .headers(headers_0),
          http("request_96")
            .post("/askllm")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0096_request.json")),
          http("request_97")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0097_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_98")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0098_request.json"))
    )
    .pause(1)
    .exec(
      http("request_99")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0099_request.json"))
    )
    .pause(1)
    .exec(
      http("request_100")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0100_request.json"))
    )
    .pause(1)
    .exec(
      http("request_101")
        .options("/configureAssistant")
        .headers(headers_0)
        .resources(
          http("request_102")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0102_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_103")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0103_request.json"))
    )
    .pause(1)
    .exec(
      http("request_104")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0104_request.json"))
    )
    .pause(1)
    .exec(
      http("request_105")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0105_request.json"))
    )
    .pause(1)
    .exec(
      http("request_106")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0106_request.json"))
        .resources(
          http("request_107")
            .options("/askllm")
            .headers(headers_0),
          http("request_108")
            .post("/askllm")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0108_request.json")),
          http("request_109")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_110")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0110_request.json")),
          http("request_111")
            .post("/configureAssistant")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0111_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_112")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0112_request.json"))
    )
    .pause(1)
  
  private val chain_1 =
    exec(
      http("request_113")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0113_request.json"))
    )
    .pause(1)
    .exec(
      http("request_114")
        .post("/configureAssistant")
        .headers(headers_6)
        .body(RawFileBody("game/playnewgameusingllmtest/0114_request.json"))
        .resources(
          http("request_115")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_116")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/playnewgameusingllmtest/0116_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_117")
        .options("/save-session")
        .headers(headers_0)
        .resources(
          http("request_118")
            .post("/save-session")
            .headers(headers_6)
            .body(RawFileBody("game/playnewgameusingllmtest/0118_request.json"))
        )
    )
    .pause(3)
    .exec(
      http("request_119")
        .get("/get-sessions/pablo")
        .headers(headers_119)
    )
  
  private val scn = scenario("PlayNewGameUsingLLMTest")
    .exec(chain_0, chain_1)

	setUp(scn.inject(constantUsersPerSec(3).during(15))).protocols(httpProtocol)
}
