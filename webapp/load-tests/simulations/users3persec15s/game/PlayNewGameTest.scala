package users3persec15s.game

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
  
  private val headers_13 = Map(
  		"If-None-Match" -> """W/"e2-6zr4fSgQpteZu0IuoYomsBBnM2M"""",
  		"Origin" -> "http://localhost:8081"
  )
  
  private val headers_16 = Map(
  		"Accept" -> "image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5",
  		"Accept-Encoding" -> "gzip, deflate, br, zstd",
  		"Priority" -> "u=5, i",
  		"Sec-Fetch-Dest" -> "image",
  		"Sec-Fetch-Mode" -> "no-cors",
  		"Sec-Fetch-Site" -> "cross-site"
  )
  
  private val headers_25 = Map(
  		"If-None-Match" -> """W/"104-fGZAarfF2iBqeTJWqKimH24fQxY"""",
  		"Origin" -> "http://localhost:8081"
  )
  
  private val headers_32 = Map(
  		"If-None-Match" -> """W/"f2-5VaS59RrWzT6zCmW37XsIkYXKYY"""",
  		"Origin" -> "http://localhost:8081"
  )
  
  private val headers_47 = Map(
  		"If-None-Match" -> """W/"12c-dDRYqgifUs2jYgbSjbsdN9Y51i4"""",
  		"Origin" -> "http://localhost:8081"
  )
  
  private val headers_54 = Map(
  		"If-None-Match" -> """W/"112-m7KzbRp9EU2fIghGouit7ApIvgU"""",
  		"Origin" -> "http://localhost:8081"
  )
  
  private val headers_62 = Map(
  		"If-None-Match" -> """W/"ee-ykT5rZ93MVO32SUBNIljtsQ6vPY"""",
  		"Origin" -> "http://localhost:8081"
  )
  
  private val headers_73 = Map(
  		"Accept" -> "*/*",
  		"Cache-Control" -> "no-cache",
  		"Content-Type" -> "application/ocsp-request",
  		"Pragma" -> "no-cache",
  		"Priority" -> "u=2"
  )
  
  private val headers_74 = Map(
  		"If-None-Match" -> """W/"ec-bLaxcOop2LGUv59bnc8f5mnm+RM"""",
  		"Origin" -> "http://localhost:8081"
  )
  
  private val headers_88 = Map(
  		"If-None-Match" -> """W/"112-xw2LI7eV8uaKy+9CP/6+EfVshtA"""",
  		"Origin" -> "http://localhost:8081"
  )
  
  private val headers_97 = Map(
  		"If-None-Match" -> """W/"11c-bU810FJ6QLFpG57FOjd2EbNvg24"""",
  		"Origin" -> "http://localhost:8081"
  )
  
  private val headers_115 = Map(
  		"If-None-Match" -> """W/"be-Knr+7/jjPxQPjRSp2+qtnfEmldw"""",
  		"Origin" -> "http://localhost:8081",
  		"Priority" -> "u=0"
  )
  
  private val headers_116 = Map(
  		"If-None-Match" -> """W/"39-b+RsOrcmLQe1lkTOH0mobsM28G8"""",
  		"Origin" -> "http://localhost:8081",
  		"Priority" -> "u=0"
  )
  
  private val uri1 = "commons.wikimedia.org"
  
  private val uri2 = "http://ocsp.digicert.com"
  
  private val uri4 = "https://upload.wikimedia.org/wikipedia/commons"

  private val scn = scenario("PlayNewGameTest")
    .exec(
      http("request_0")
        .options("/startGame")
        .headers(headers_0)
        .resources(
          http("request_1")
            .post("/startGame")
            .headers(headers_1)
            .body(RawFileBody("game/playnewgametest/0001_request.json")),
          http("request_2")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_3")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0003_request.json")),
          http("request_4")
            .get("http://" + uri1 + "/wiki/Special:FilePath/Beach%20on%20Upolu%20Island%2C%20Samoa%2C%202009.jpg")
            .headers(headers_4),
          http("request_5")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0005_request.json")),
          http("request_6")
            .get(uri4 + "/a/a9/Beach_on_Upolu_Island%2C_Samoa%2C_2009.jpg")
            .headers(headers_6),
          http("request_7")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0007_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_8")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/playnewgametest/0008_request.json"))
    )
    .pause(1)
    .exec(
      http("request_9")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/playnewgametest/0009_request.json"))
    )
    .pause(1)
    .exec(
      http("request_10")
        .options("/configureAssistant")
        .headers(headers_0)
        .resources(
          http("request_11")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0011_request.json")),
          http("request_12")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/playnewgametest/0012_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_13")
        .get("/nextQuestion?category=Geografia")
        .headers(headers_13)
        .resources(
          http("request_14")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0014_request.json")),
          http("request_15")
            .get("http://" + uri1 + "/wiki/Special:FilePath/Satellite%20image%20of%20Nepal%20in%20October%202002.jpg")
            .headers(headers_4),
          http("request_16")
            .get("https://" + uri1 + "/wiki/Special:Redirect/file/Satellite_image_of_Nepal_in_October_2002.jpg")
            .headers(headers_16),
          http("request_17")
            .get(uri4 + "/8/84/Satellite_image_of_Nepal_in_October_2002.jpg")
            .headers(headers_16),
          http("request_18")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_19")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0019_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_20")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/playnewgametest/0020_request.json"))
        .resources(
          http("request_21")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0021_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_22")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/playnewgametest/0022_request.json"))
    )
    .pause(1)
    .exec(
      http("request_23")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/playnewgametest/0023_request.json"))
        .resources(
          http("request_24")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/playnewgametest/0024_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_25")
        .get("/nextQuestion?category=Geografia")
        .headers(headers_25)
        .resources(
          http("request_26")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_27")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0027_request.json")),
          http("request_28")
            .get("http://" + uri1 + "/wiki/Special:FilePath/000%20Sllovakia%20harta.PNG")
            .headers(headers_4),
          http("request_29")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0029_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_30")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/playnewgametest/0030_request.json"))
        .resources(
          http("request_31")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/playnewgametest/0031_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_32")
        .get("/nextQuestion?category=Geografia")
        .headers(headers_32)
        .resources(
          http("request_33")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_34")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0034_request.json")),
          http("request_35")
            .get("http://" + uri1 + "/wiki/Special:FilePath/The%20Acropolis%20and%20Mount%20Hymettus%20from%20Philopappos%20Hill%20on%20July%2018%2C%202019.jpg")
            .headers(headers_4)
        )
    )
    .pause(1)
    .exec(
      http("request_36")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/playnewgametest/0036_request.json"))
    )
    .pause(1)
    .exec(
      http("request_37")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/playnewgametest/0037_request.json"))
    )
    .pause(1)
    .exec(
      http("request_38")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/playnewgametest/0038_request.json"))
        .resources(
          http("request_39")
            .get(uri4 + "/9/9e/The_Acropolis_and_Mount_Hymettus_from_Philopappos_Hill_on_July_18%2C_2019.jpg")
            .headers(headers_16),
          http("request_40")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_41")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0041_request.json")),
          http("request_42")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0042_request.json")),
          http("request_43")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0043_request.json")),
          http("request_44")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0044_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_45")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/playnewgametest/0045_request.json"))
        .resources(
          http("request_46")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/playnewgametest/0046_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_47")
        .get("/nextQuestion?category=Geografia")
        .headers(headers_47)
        .resources(
          http("request_48")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_49")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0049_request.json")),
          http("request_50")
            .get("http://" + uri1 + "/wiki/Special:FilePath/SLO%20%E2%80%94%20Ljubljana%20%28Blick%20auf%20Burg%29%202020.JPG")
            .headers(headers_4),
          http("request_51")
            .get(uri4 + "/c/c0/SLO_%E2%80%94_Ljubljana_%28Blick_auf_Burg%29_2020.JPG")
            .headers(headers_16),
          http("request_52")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0052_request.json")),
          http("request_53")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/playnewgametest/0053_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_54")
        .get("/nextQuestion?category=Geografia")
        .headers(headers_54)
        .resources(
          http("request_55")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_56")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0056_request.json")),
          http("request_57")
            .get("http://" + uri1 + "/wiki/Special:FilePath/Aj-map.png")
            .headers(headers_4),
          http("request_58")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0058_request.json")),
          http("request_59")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0059_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_60")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/playnewgametest/0060_request.json"))
        .resources(
          http("request_61")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/playnewgametest/0061_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_62")
        .get("/nextQuestion?category=Geografia")
        .headers(headers_62)
        .resources(
          http("request_63")
            .options("/configureAssistant")
            .headers(headers_0),
          http("request_64")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0064_request.json")),
          http("request_65")
            .get("http://" + uri1 + "/wiki/Special:FilePath/Dannebrog.jpg")
            .headers(headers_4)
        )
    )
    .pause(1)
    .exec(
      http("request_66")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/playnewgametest/0066_request.json"))
        .resources(
          http("request_67")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0067_request.json")),
          http("request_68")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0068_request.json")),
          http("request_69")
            .get(uri4 + "/8/83/Dannebrog.jpg")
            .headers(headers_16)
        )
    )
    .pause(1)
    .exec(
      http("request_70")
        .options("/configureAssistant")
        .headers(headers_0)
        .resources(
          http("request_71")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0071_request.json")),
          http("request_72")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/playnewgametest/0072_request.json")),
          http("request_73")
            .post(uri2 + "/")
            .headers(headers_73)
            .body(RawFileBody("game/playnewgametest/0073_request.dat"))
        )
    )
    .pause(1)
    .exec(
      http("request_74")
        .get("/nextQuestion?category=Geografia")
        .headers(headers_74)
        .resources(
          http("request_75")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0075_request.json")),
          http("request_76")
            .get("http://" + uri1 + "/wiki/Special:FilePath/Satellite%20image%20of%20Guatemala%20in%20April%202002.jpg")
            .headers(headers_4),
          http("request_77")
            .get(uri4 + "/a/a3/Satellite_image_of_Guatemala_in_April_2002.jpg")
            .headers(headers_16),
          http("request_78")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0078_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_79")
        .options("/configureAssistant")
        .headers(headers_0)
        .resources(
          http("request_80")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0080_request.json")),
          http("request_81")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0081_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_82")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/playnewgametest/0082_request.json"))
    )
    .pause(1)
    .exec(
      http("request_83")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/playnewgametest/0083_request.json"))
    )
    .pause(1)
    .exec(
      http("request_84")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/playnewgametest/0084_request.json"))
    )
    .pause(1)
    .exec(
      http("request_85")
        .options("/configureAssistant")
        .headers(headers_0)
        .resources(
          http("request_86")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0086_request.json")),
          http("request_87")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/playnewgametest/0087_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_88")
        .get("/nextQuestion?category=Geografia")
        .headers(headers_88)
        .resources(
          http("request_89")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0089_request.json")),
          http("request_90")
            .get("http://" + uri1 + "/wiki/Special:FilePath/Eritrea%20-%20Location%20Map%20%282013%29%20-%20ERI%20-%20UNOCHA.svg")
            .headers(headers_4),
          http("request_91")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0091_request.json"))
        )
    )
    .pause(1000.milliseconds)
    .exec(
      http("request_92")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/playnewgametest/0092_request.json"))
    )
    .pause(1)
    .exec(
      http("request_93")
        .options("/configureAssistant")
        .headers(headers_0)
        .resources(
          http("request_94")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0094_request.json")),
          http("request_95")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0095_request.json")),
          http("request_96")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/playnewgametest/0096_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_97")
        .get("/nextQuestion?category=Geografia")
        .headers(headers_97)
        .resources(
          http("request_98")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0098_request.json")),
          http("request_99")
            .get("http://" + uri1 + "/wiki/Special:FilePath/%40HaNgryBam.jpg")
            .headers(headers_4)
        )
    )
    .pause(1)
    .exec(
      http("request_100")
        .options("/configureAssistant")
        .headers(headers_0)
        .resources(
          http("request_101")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0101_request.json")),
          http("request_102")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0102_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_103")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/playnewgametest/0103_request.json"))
    )
    .pause(1)
    .exec(
      http("request_104")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/playnewgametest/0104_request.json"))
        .resources(
          http("request_105")
            .get(uri4 + "/3/31/%40HaNgryBam.jpg")
            .headers(headers_16),
          http("request_106")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0106_request.json"))
        )
    )
    .pause(1000.milliseconds)
    .exec(
      http("request_107")
        .options("/configureAssistant")
        .headers(headers_0)
        .resources(
          http("request_108")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0108_request.json")),
          http("request_109")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0109_request.json"))
        )
    )
    .pause(1)
    .exec(
      http("request_110")
        .post("/configureAssistant")
        .headers(headers_3)
        .body(RawFileBody("game/playnewgametest/0110_request.json"))
        .resources(
          http("request_111")
            .post("/configureAssistant")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0111_request.json")),
          http("request_112")
            .post("/configureAssistant")
            .headers(headers_1)
            .body(RawFileBody("game/playnewgametest/0112_request.json"))
        )
    )
    .pause(2)
    .exec(
      http("request_113")
        .options("/save-session")
        .headers(headers_0)
        .resources(
          http("request_114")
            .post("/save-session")
            .headers(headers_3)
            .body(RawFileBody("game/playnewgametest/0114_request.json"))
        )
    )
    .pause(5)
    .exec(
      http("request_115")
        .get("/get-user-sessions/gatling")
        .headers(headers_115)
        .resources(
          http("request_116")
            .get("/get-users-totaldatas")
            .headers(headers_116)
        )
    )

	setUp(scn.inject(constantUsersPerSec(3).during(15))).protocols(httpProtocol)
}
