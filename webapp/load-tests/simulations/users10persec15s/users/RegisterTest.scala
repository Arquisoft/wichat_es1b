package users10persec15s.users

import scala.concurrent.duration._

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.jdbc.Predef._

class RegisterTest extends Simulation {

  private val httpProtocol = http
    .baseUrl("http://localhost:8000")
    .inferHtmlResources()
    .acceptHeader("application/json, text/plain, */*")
    .acceptEncodingHeader("gzip, deflate")
    .acceptLanguageHeader("es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3")
    .originHeader("http://localhost:8081")
    .userAgentHeader("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0")
  
  private val headers_0 = Map(
  		"Accept" -> "*/*",
  		"Access-Control-Request-Headers" -> "content-type",
  		"Access-Control-Request-Method" -> "POST",
  		"Priority" -> "u=4"
  )
  
  private val headers_1 = Map(
  		"Content-Type" -> "application/json",
  		"Priority" -> "u=0"
  )
  
  private val headers_3 = Map("Content-Type" -> "application/json")


  private val scn = scenario("RegisterTest")
    .exec(
      http("request_0")
        .options("/adduser")
        .headers(headers_0)
        .resources(
          http("request_1")
            .post("/adduser")
            .headers(headers_1)
            .body(RawFileBody("users/registertest/0001_request.json")),
          http("request_2")
            .options("/login")
            .headers(headers_0),
          http("request_3")
            .post("/login")
            .headers(headers_3)
            .body(RawFileBody("users/registertest/0003_request.json"))
        )
    )
    .pause(3)
    .exec(
      http("request_4")
        .get("/get-users-totaldatas")
        .resources(
          http("request_5")
            .get("/get-user-sessions/gatling")
        )
    )

	setUp(scn.inject(constantUsersPerSec(10).during(15))).protocols(httpProtocol)
}
