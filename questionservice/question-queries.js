var queries = {};

queries["es"] = {
      "Geografia":
            [
                  /* pregunta = imagen de un país, opción = nombre del país */
                  [
                        `
      SELECT DISTINCT ?option ?optionLabel ?imageLabel
      WHERE {
        ?option wdt:P31 wd:Q6256;               
              rdfs:label ?optionLabel;          
        
        OPTIONAL { ?option wdt:P18 ?imageLabel. }    
        FILTER(lang(?optionLabel) = "es")       
        FILTER EXISTS { ?option wdt:P18 ?imageLabel }
      }
    `, "¿Cuál es el lugar de la imagen?"]
            ],

      "Cultura":
            [
            /* pregunta = imagen monumento, opción = nombre del monumento */
                  [
                        `
      SELECT ?option ?optionLabel ?imageLabel
      WHERE {
        ?option wdt:P31 wd:Q4989906; 
                  wdt:P17 wd:Q29;                
                  wdt:P18 ?imageLabel.                  
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es". }
      }
      LIMIT 100
      `, "¿Qué monumento es este?"]
            ],

      "Personajes":
            [
            /* pregunta = imagen futbolista, opción = nombre futbolista */
                  [
                        `
      SELECT ?optionLabel ?imageLabel
      WHERE {
        ?option wdt:P106 wd:Q937857;     
                wdt:P569 ?birthdate.     
        FILTER(YEAR(?birthdate) >= 1970)  
        ?option wdt:P18 ?imageLabel.     
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es". }
      }
      LIMIT 100
      `, "¿Quién es esta persona famosa?"]
            ]
}

module.exports = { queries };