module.exports = {
   "storage":{
        "dbName":"./entities.sqlite3"
   },
   "authentication":{
       "web-server":"http://127.0.0.1:3000/api/",

  },"schema-validation":[
    {
      "id": "/Sensor",
      "type": "object",
      "properties": {
        "name": {"type": "string"},
        "token": {"type": "string"}
      },
      "required": ["name"]
    },
    {
      "id": "/SimpleAddress",
      "type": "object",
      "properties": {
        "lines": {
          "type": "array",
          "items": {"type": "string"}
        },
        "zip": {"type": "string"},
        "city": {"type": "string"},
        "country": {"type": "string"}
      },
      "required": ["country","lines"]
    },
    {
      "id": "/SimplePerson",
      "type": "object",
      "properties": {
        "name": {"type": "string"},
        "address": {"$ref": "/SimpleAddress"},
        "votes": {"type": "integer", "minimum": 1}
      },
      "required":["address"]

    }
  ]
}
