
#Q.no.1.#############################################

PUT recipes
{
    "mappings": {
        "_doc": {
            "dynamic": false,
            "properties": {
                "title": {
                    "type": "text"
                },
                "description": {
                    "type": "text"
                },
                "preparation_time_minutes": {
                    "type": "integer"
                },
                "servings": {
                    "properties": {
                        "min": {
                            "type": "integer"
                        },
                        "max": {
                            "type": "integer"
                        }
                    }
                },
                "steps": {
                    "type": "text"
                },
                "ingredients": {
                    "type": "nested",
                    "properties": {
                        "name": {
                            "type": "text"
                        },
                        "quantity": {
                            "type": "keyword"
                        }
                    }
                },
                "created": {
                    "type": "date",
                    "format": "yyyy/MM/dd"
                },
                "ratings": {
                    "type": "double"
                }
            }
        }
    }
}
---------------------------------------------------------------
PUT new_analyzer
{
    "settings": {
        "index": {
            "analysis": {
                "analyzer": {
                    "custom_analyzer": {
                        "type": "custom",
                        "tokenizer": "standard",
                        "filter": [
                            "lowercase",
                            "custom_stopwords",
                            "synonyms_recipes"
                        ]
                    }
                },
                "filter": {
                    "custom_stopwords": {
                        "type": "stop",
                        "stopwords": "_english_"
                    },
                    "synonyms_recipes": {
                        "type": "synonym",
                        "synonyms_path": "synonyms_recipes.txt"
                    }
                }
            }
        }
    },
    "mappings": {
        "_doc": {
            "properties": {
                "description": {
                    "type": "text",
                    "analyzer": "custom_analyzer"
                },
                "steps": {
                    "type": "text",
                    "analyzer": "custom_analyzer"
                }
            }
        }
    }
}

#Q.no.2#####################################################Bulk Insert #############
curl -H "Content-Type: application/json" -XPOST "http://localhost:9200/recipes/_doc/_bulk?pretty" --data-binary @recipe.json

#Q.no3.###############################




