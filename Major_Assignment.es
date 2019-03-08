
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


#Q.no.4.##############################
GET recipes/_search

GET product/_search
{
  "query": {
    "bool": {
      "must_not": {
        "exists": {
          "field": "tags"
        }
      }
    }
  }
}

POST recipes/_update_by_query?conflicts=proceed
{
    "query": {
        "nested": {
            "path": "ingredients"
        }
    }
}

#Q.no.5.##################################
POST recipes/_delete_by_query
{
    "query": {
        "term": {
            "ratings": "NULL"
        }
    }
}

#Q.no.6 ###################################
PUT recipes/_mapping/_doc
{
  "properties": {
    "steps": { 
      "type":     "text",
      "fielddata": true
    }
  }
}

GET recipes/_search
{
    "_source": ["title", "ratings", "steps"],
    "query": {
        "nested": {
            "path": "ingredients",
            "query": {
                "match": {
                    "ingredients.name": "egg"
                }
            }
        }
    },
    "script_fields": {
        "number_of_steps": {
            "script": {
                "lang": "painless",
                "source": "params['_source']['steps'].size()"
            }
        }
    },
    "sort": [
        {
            "ratings": {
                "mode": "avg"
            }
        }
    ] 
}
#Q.no.7 #####################################
GET recipes/_search

GET recipes/_doc/_search
{
    "size":0,
    "aggs":{
        "avg_amount":{
            "avg": {
            "field": "preparation_time_minutes"
            }
        }
    }
}

PUT recipes/_mapping/_doc
{
    "properties": {
        "num_of_ingredients": {
            "type": "integer"
        }
    }
}
POST recipes/_doc/_update_by_query
{
    "query": {
        "match_all": {}
    },
    "script": {
        "source": "ctx._source.num_of_ingredients = ctx._source.ingredients.size()"
    }
}

POST orders/_doc/_update_by_query
{
    "script": {
        "source": "ctx._source.enhance=10"
    },
    "query": {
        "match_all": {}
    }
}

GET recipes/_doc/_search
{
    "size": 0,
    "aggs": {
        "weighted_avg_amount": {
            "weighted_avg": {
                "value": {
                    "field": "preparation_time_minutes"
                },
                "weight": {
                    "field": "enhance"
                }
            }
        }
    }
}

GET recipes/_doc/_search
{
    "size": 0,
    "aggs": {
            "total_ingredients": {
                "max": {
                    "field": "preparation_time_minutes"
                }
        }
    }
}

GET recipes/_doc/_search
{
    "size": 0,
    "aggs": {
            "total_ingredients": {
                "sum": {
                    "field": "preparation_time_minutes"
                }
        }
    }
}

GET recipes/_doc/_search
{
    "size": 0,
    "aggs": {
            "total_ingredients": {
                "min": {
                    "field": "preparation_time_minutes"
                }
        }
    }
}


/* Bucket Aggregations */

GET recipes/_doc/_search
{
    "size": 0,
    "aggs": {
        "num_of_ingredients": {
            "terms": {
                "field": "created",
                "missing": "1970/01/01",
                "min_doc_count": 0
            }
        }
    }
}

GET recipes/_doc/_search
{
    "size": 0,
    "aggs": {
        "created": {
            "terms": {
                "field": "created",
                "size": 5,
                "show_term_doc_count_error": true,
                "order": {
                    "_key": "asc"
                }
            }
        }
    }
}

GET recipes/_doc/_search
{
    "size": 0,
    "aggs": {
        "preparation_time_range": {
            "range": {
                "field": "preparation_time_minutes",
                "ranges": [
                    {
                        "from": 10,
                        "to": 25
                    }
                ]
            }
        }
    }
}

GET recipes/_doc/_search
{
    "size": 0,
    "aggs": {
        "preparation_time_range": {
            "range": {
                "field": "preparation_time_minutes",
                "ranges": [
                    {
                        "key": "quick recipes",
                        "to": 10
                    },
                    {
                        "key": "failry quick recipes",
                        "from": 10,
                        "to": 25
                    },
                    {
                        "key": "very long recipes",
                        "from": 25
                    }
                ]
            }
        }
    }
}

GET recipes/_doc/_search
{
    "size": 0,
    "aggs": {
        "created_range": {
            "date_range": {
                "field": "created",
                "format": "yyyy/mm/dd",
                "ranges": [
                    {
                        "to": "2010/01/01"
                    },
                    {
                        "from": "2010/01/01"
                    }
                ]
            }
        }
    }
}


/* Sub Aggregations */

/* metric aggregation within bucket aggregation */

GET recipes/_doc/_search
{
    "size": 0,
    "aggs": {
        "preparation_time_range": {
            "range": {
                "script": {
                    "source": "doc.preparation_time_minutes.value"
                },
                "keyed": true,
                "ranges": [
                    {
                        "key": "quick recipes",
                        "to": 10
                    },
                    {
                        "key": "fairyl quick recipes",
                        "from": 10,
                        "to": 25
                    },
                    {
                        "key": "very long recipes",
                        "from": 25
                    }
                ]
            },
            "aggs":{
                "statistics": {
                    "stats": {
                        "script": {
                            "source": "doc.preparation_time_minutes.value"
                        }
                    }
                }
            }
        }
    }
}

/* bucket aggregation within another bucket aggregation */

GET recipes/_doc/_search
{
    "size": 0,
    "aggs": {
        "preparation_time_minutes": {
            "terms": {
                "field": "preparation_time_minutes"
            },
            "aggs": {
                "created": {
                    "terms": {
                        "field": "created"
                    }
                }
            }
        }
    }
}

#Q.no.8#############################################

GET recipes/_doc/_search
{
    "query": {
        "bool": {
            "must": [
                {
                    "match_phrase": {
                        "title": {
                            "query": "tomato",
                            "slop": 3
                        }
                    }
                },
                {
                    "fuzzy": {
                        "description": {
                            "value": "sause",
                            "fuzziness": 2
                        }
                    }
                }
            ],
            "filter": [
                {
                    "range": {
                        "created": {
                            "gt": "2010/01/01"
                        }
                    }
                },
                {
                    "query_string": {
                        "default_field": "description",
                        "query": "(paste) or (pasta)"
                    }
                }
            ],
            "should": [
                {
                    "range": {
                        "preparation_time_minutes": {
                            "gt": 15
                        }
                    }
                }
            ]
        }
    }
}

#Q.no.9#############################################

GET recipes/_search
{
    "query": {
        "match": {
            "steps": {
                "query": "shaken but not stirred",
                "cutoff_frequency": 11
            }
        }
    }
}

GET recipes/_search
{
    "query": {
        "match": {
            "steps": {
                "query": "shaken but not stirred",
                "cutoff_frequency": 0.001
            }
        }
    }
}

GET recipes/_search
{
    "query": {
        "common": {
            "steps": {
                "query": "boiling hot water",
                "cutoff_frequency": 0.001,
                "low_freq_operator": "and"
            }
        }
    }
}

GET recipes/_search
{
    "query": {
        "common": {
            "steps": {
                "query": "more cheese",
                "cutoff_frequency": 0.005,
                "high_freq_operator": "or"
            }
        }
    }
}

#Q.no.10######################################

PUT store
{
    "mappings": {
        "_doc": {
            "dynamic": false,
            "properties": {
                "item_id": {
                    "type": "integer"
                },
                "name": {
                    "type": "text"
                },
                "stock": {
                    "type": "integer"
                },
                "vendor": {
                    "properties": {
                        "name": {
                            "type": "text"
                        },
                        "contact": {
                            "type": "keyword"
                        },
                        "address": {
                            "type": "geo_point"
                        }
                    } 
                }
            }
        }
    }
}

/*
B. Bulk insert at least 5 documents into items index.
*/

PUT store/_doc/_bulk
{"index":{"_id":1}}
{"item_id":1,"name":"Sugar","stock": 300, "vendor": {"name": "Big Mart", "contact": "01556738", "address": {"lat": 65.43, "lon": 43.54}}}
{"index":{"_id":2}}
{"item_id":2,"name":"Shampoo","stock": 150, "vendor": {"name": "Clinc Plus", "contact": "01665362", "address": {"lat": 67.73, "lon": 34.74}}}
{"index":{"_id":3}}
{"item_id":3,"name":"Detergent","stock": 200, "vendor": {"name": "Surf Excel", "contact": "01419203", "address": {"lat": 66.56, "lon": 39.78}}}
{"index":{"_id":4}}
{"item_id":4,"name":"Lipstick","stock": 100, "vendor": {"name": "Loreal", "contact": "01558732", "address": {"lat": 64.21, "lon": 42.74}}}
{"index":{"_id":5}}
{"item_id":5,"name":"Handcream","stock": 500, "vendor": {"name": "Himani", "contact": "01437283", "address": {"lat": 66.32, "lon": 47.34}}}

/*
C. Try performing geo bounding box and geo distance queries in the vendor’s address.
*/

GET store/_search
{
    "query": {
        "bool": {
            "filter": {
                "geo_bounding_box": {
                    "vendor.address": {
                        "top_left": {
                            "lat": 66.00,
                            "lon": 42.00
                        },
                        "bottom_right": {
                            "lat": 62.00,
                            "lon": 50.00
                        }
                    }
                }
            }
        }
    }
}

/*
D. Create an index category_items with mapping having following fields:
category: text field
Items: array of item_ids, that means, array of integer
*/

PUT category_items
{
    "mappings": {
        "_doc": {
            "dynamic": false,
            "properties": {
                "category": {
                    "type": "text"
                },
                "items": {
                    "type": "nested",
                    "properties": {
                        "item_ids": {
                            "type": "integer"
                        }
                    }
                }
            }
        }
    }
}

/*
E. Insert two documents in category_items: one related to cosmetic category and next related to household 
category. When inserting documents in category_items, please note that each category should have at least 
one item_id inserted in items index. 
*/

PUT category_items/_doc/1
{
    "category": "cosmetic",
    "items": [
        {
            "item_ids": 4
        },
        {
            "item_ids": 5
        }
    ]
}

PUT category_items/_doc/2
{
    "category": "household",
    "items": [
        {
            "item_ids": 1
        },
        {
            "item_ids": 3
        }
    ]
}

/*
F. Using terms query with terms lookup mechanism, find the items from items index 
that belong to cosmetic category.
*/

GET store/_search
{
  "query": {
    "terms": {
      "item_id": {
        "index": "category_items",
        "type": "_doc",
        "id": 1,
        "path": "items.item_ids"
      }
    }
  }
}


#Q.no.11#############################################

POST /_aliases
{
    "actions": [
        {
            "add": {
                "index": "orders",
                "alias": "order_sample",
                "filter": {
                    "bool": {
                        "must": [
                            {
                                "query_string": {
                                    "default_field": "status",
                                    "query": "(processed) or (completed)" 
                                }
                            },
                            {
                                "query_string": {
                                    "default_field": "sales_channel",
                                    "query": "(phone) and (app)" 
                                }
                            },
                            {
                                "range": {
                                    "total_amount": {
                                        "gte": 100
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        }
    ]
}

#Q.no.12#######################################

/* Term Query */
GET order_sample/_search
{
    "query": {
        "term": {
            "status": {
                "value": "completed"
            }
        }
    }
}

/* Range Query */
GET order_sample/_search
{
    "query": {
        "range": {
            "total_amount": {
                "gte": 150,
                "lte": 200
            }
        }
    }
}

/*  Prefix Query */
GET order_sample/_search
{
    "query": {
        "prefix": {
            "salesman.name": "lena"
        }
    }
}

/* Wildcard Queries */
GET order_sample/_search
{
    "query": {
        "wildcard": {
            "salesman.name": "l??a"
        }
    }
}

GET order_sample/_search
{
    "query": {
        "wildcard": {
            "salesman.name": "l*a"
        }
    }
}

/* Match Query */
GET order_sample/_search
{
    "query": {
        "match": {
            "salesman.name": "rene"
        }
    }
}

/* Fuzzy Match */
GET order_sample/_search
{
    "query": {
        "match": {
            "salesman.name": {
                "query": "lena",
                "fuzziness": 2
            }
        }
    }
}

/*
Creativity Check
*/

PUT gaming_club
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
                            "custom_synonyms"
                        ]
                    }
                },
                "filter": {
                    "custom_stopwords": {
                        "type": "stop",
                        "stopwords": "_english_"
                    },
                    "custom_synonyms": {
                        "type": "synonym",
                        "synonyms": ["game=>play","team=>squad", "league=>division",
                        "ping=>lag", "csgo=>CounterStrikeGo",
                        "spectate=>view"
                        ]
                    }
                }
            }
        }
    },
    "mappings": {
        "_doc": {
            "dynamic": false,
            "properties": {
                "name": {
                    "type": "text"
                },
                "league": {
                    "type": "text"
                },
                "established_date": {
                    "type": "date",
                    "format": "yyyy-MM-dd"
                },
                "location": {
                    "type": "keyword"
                },
                "mouse": {
                    "type": "nested",
                    "properties": {
                        "color": {
                            "type": "keyword"
                        },
                        "type": {
                            "type": "keyword"
                        }
                    }
                },
                "laptop": {
                    "properties": {
                        "name": {
                            "type": "text"
                        },
                        "RAM": {
                            "type": "geo_point"
                        },
                        "storage": {
                            "type": "integer"
                        }
                    }
                },
                "current_manager": {
                    "properties": {
                        "name": {
                            "type": "text"
                        },
                        "years_in_charge": {
                            "type": "double"
                        }
                    }
                },
                "no_of_trophies_won": {
                    "type": "integer"
                },
                "privately_owned": {
                    "type": "boolean"
                },
                "players_age_range": {
                    "type": "integer_range"
                },
                "market_value": {
                    "type": "double"
                }
            }
        }
    }
}

/*
Bulk insert at least 10 documents creating a json file yourself and by using curl.
*/

curl -H "Content-Type: application/json" 
    -XPOST "http://localhost:9200/gaming_club/_doc/_bulk?pretty" 
    --data-binary @gaming_club.json

/*
Perform as many different searches and aggregations as you would like to for analyzing various aspects of 
your data.
*/

GET gaming_club/_search

/* Searching with Synonyms */
GET gaming_club/_doc/_search
{
    "query": {
        "match": {
            "name": "multiplayer csgo"
        }
    }, 
    "highlight": {
        "fields": {
            "name": {}
        }
    }
}

GET gaming_club/_doc/_search
{
    "query": {
        "match_phrase_prefix": {
            "league": "single player dota"
        }
    }
}

/* Fuzzy Query */
GET gamingclub_club/_doc/_search
{
    "query": {
        "fuzzy" : {
            "league" : {
                "value": "league",
                "fuzziness": 4
            }
        }
    }
}

/* Nested Bool Query */
GET gaming_club/_doc/_search
{
    "query": {
        "nested": {
            "path": "kit",
            "query": {
                "bool": {
                    "must": [
                        {
                            "term": {
                                "kit.color": {
                                    "value": "white"
                                }
                            }
                        }
                    ],
                    "should": [
                        {
                            "term": {
                                "kit.type": {
                                    "value": "away"
                                }
                            }
                        }
                    ]
                }   
            }
        }
    }
}



/* Sort */
GET gaming_club/_doc/_search
{
    "query": {
        "match_all": {}
    },
    "sort": [
        {
            "market_value_in_billion": {
                "order": "desc"
            }
        }
    ]
}

/* Range Aggregation with Custom Keys */
GET gaming_club/_doc/_search
{
    "size": 0,
    "aggs": {
        "success_index": {
            "range": {
                "field": "no_of_trophies_won",
                "ranges": [
                    {
                        "key": "Successful",
                        "to": 40
                    },
                    {
                        "key": "Very Successful",
                        "from": 40,
                        "to": 80
                    },
                    {
                        "key": "Most Successful",
                        "from": 80
                    }
                ]
            }
        }
    }
}

/* Bucket Aggregation */

PUT gaming_club/_mapping/_doc
{
  "properties": {
    "league": { 
      "type":     "text",
      "fielddata": true
    }
  }
}

GET gaming_club/_doc/_search
{
    "size": 0,
    "aggs": {
        "clubs_in_different_leagues": {
            "terms": {
                "field": "league",
                "min_doc_count": 0
            }
        }
    }
}

/* Extended stats */
GET gaming_club/_doc/_search
{
  "size": 0,
  "aggs": {
    "stats": {
      "extended_stats": {
        "field": "market_value_in_billion"
      }
    }
  }
}

