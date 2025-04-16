package ramp75users15s.app

import scala.concurrent.duration._

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.jdbc.Predef._

class NavigateThroughTheAppTest extends Simulation {

  private val httpProtocol = http
    .baseUrl("http://localhost:8000")
    .inferHtmlResources()
    .acceptHeader("application/json, text/plain, */*")
    .acceptEncodingHeader("gzip, deflate")
    .acceptLanguageHeader("es-ES,es;q=0.8,en-US;q=0.5,en;q=0.3")
    .originHeader("http://localhost:8081")
    .userAgentHeader("Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0")
  
  private val headers_0 = Map(
  		"If-None-Match" -> """W/"6c8-6AeTM++FxITVd5B5b5beWWXmh8Y"""",
  		"Priority" -> "u=0"
  )
  
  private val headers_2 = Map(
  		"If-None-Match" -> """W/"76-UzWxL98qZUmbKVj/BMbHhe4JRu4"""",
  		"Priority" -> "u=0"
  )
  
  private val headers_6 = Map(
  		"Accept" -> "*/*",
  		"Access-Control-Request-Headers" -> "content-type",
  		"Access-Control-Request-Method" -> "POST",
  		"Priority" -> "u=4"
  )
  
  private val headers_7 = Map(
  		"Content-Type" -> "application/json",
  		"Priority" -> "u=0"
  )
  
  private val headers_8 = Map("If-None-Match" -> """W/"6c8-6AeTM++FxITVd5B5b5beWWXmh8Y"""")
  
  private val headers_9 = Map("If-None-Match" -> """W/"76-UzWxL98qZUmbKVj/BMbHhe4JRu4"""")


  private val scn = scenario("NavigateThroughTheAppTest")
    .exec(
      http("request_0")
        .get("/get-user-sessions/gatling")
        .headers(headers_0)
    )
    .pause(7)
    .exec(
      http("request_1")
        .get("/get-user-sessions/gatling")
        .headers(headers_0)
        .resources(
          http("request_2")
            .get("/get-users-totaldatas")
            .headers(headers_2)
        )
    )
    .pause(27)
    .exec(
      http("request_3")
        .get("/get-user-sessions/gatling")
        .headers(headers_0)
    )
    .pause(2)
    .exec(
      http("request_4")
        .get("/get-user-sessions/gatling")
        .headers(headers_0)
        .resources(
          http("request_5")
            .get("/get-users-totaldatas")
            .headers(headers_2)
        )
    )
    .pause(13)
    .exec(
      http("request_6")
        .options("/login")
        .headers(headers_6)
        .resources(
          http("request_7")
            .post("/login")
            .headers(headers_7)
            .body(RawFileBody("app/navigatethroughtheapptest/0007_request.json")),
          http("request_8")
            .get("/get-user-sessions/gatling")
            .headers(headers_8),
          http("request_9")
            .get("/get-users-totaldatas")
            .headers(headers_9)
        )
    )

	setUp(scn.inject(rampUsers(75).during(15.seconds))).protocols(httpProtocol)
}
