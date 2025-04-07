package users

import scala.concurrent.duration._

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.jdbc.Predef._

class ProfileTest extends Simulation {

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
  
  private val headers_6 = Map(
  		"If-None-Match" -> """W/"62d-KhFnIFoVPfoK2stJGO7EsiIiYNc"""",
  		"Origin" -> "http://localhost:3000",
  		"Priority" -> "u=0"
  )
  
  private val uri1 = "localhost"

  private val scn = scenario("ProfileTest")
    .exec(
      http("request_0")
        .get("http://" + uri1 + ":3000/")
        .headers(headers_0)
        .resources(
          http("request_1")
            .get("http://" + uri1 + ":3000/static/js/main.b4f0bfa3.js")
            .headers(headers_1),
          http("request_2")
            .get("http://" + uri1 + ":3000/static/css/main.d8168a55.css")
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
            .body(RawFileBody("users/profiletest/0004_request.json")),
          http("request_5")
            .get("/get-sessions/pablo")
            .headers(headers_5)
        )
    )
    .pause(2)
    .exec(
      http("request_6")
        .get("/get-sessions/pablo")
        .headers(headers_6)
    )
    .pause(18)
    .exec(
      http("request_7")
        .get("/get-sessions/pablo")
        .headers(headers_6)
    )

	setUp(scn.inject(constantUsersPerSec(3).during(15))).protocols(httpProtocol)
}
