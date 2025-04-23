package users3persec15s.users

import scala.concurrent.duration._

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.jdbc.Predef._

class LoginTest extends Simulation {

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
  
  private val headers_2 = Map("If-None-Match" -> """W/"39-b+RsOrcmLQe1lkTOH0mobsM28G8"""")
  
  private val headers_3 = Map("If-None-Match" -> """W/"be-Knr+7/jjPxQPjRSp2+qtnfEmldw"""")


  private val scn = scenario("LoginTest")
    .exec(
      http("request_0")
        .options("/login")
        .headers(headers_0)
        .resources(
          http("request_1")
            .post("/login")
            .headers(headers_1)
            .body(RawFileBody("users/logintest/0001_request.json")),
          http("request_2")
            .get("/get-users-totaldatas")
            .headers(headers_2),
          http("request_3")
            .get("/get-user-sessions/gatling")
            .headers(headers_3)
        )
    )

	setUp(scn.inject(constantUsersPerSec(3).during(15))).protocols(httpProtocol)
}
