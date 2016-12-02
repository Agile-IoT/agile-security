module.exports = {
   "storage":{
        "dbName":"./database_"
   },
   "schema-validation":[
    {
      "id": "/sensor",
      "type": "object",
      "properties": {
        "name": {"type": "string"}
      },
      "credentials": {
        "type": "array",
        "items": {
            "type": "object",
            "properties": {
               "system":{"type": "string"},
               "value" :{"type": "string"}
            }
        }
      },
      "required": ["name"]
    },
    {
      "id": "/user",
      "type": "object",
      "properties": {
        "user_name": {"type": "string"},
        "auth_type": {"type": "string"},
        "password": {"type": "string"}
      },
      "required": ["user_name","auth_type"]
    },
    {
      "id": "/client",
      "type": "object",
      "properties": {
        "name": {"type": "string"},
        "clientSecret": {"type": "string"},
        "redirectURI": {"type": "string"}
      },
      "required": ["name","clientSecret","redirectURI"]
    }
  ]
};
