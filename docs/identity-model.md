# Identity Model

Explain that we chose an attribute-based solution since it can support other models such as role based or group based models.

## Entities 

Everything is an entity. Even users.


## Attribute Management

In a sense attribute authorities regulate who can write to attributes, while attribute visibility lets users see only the attributes they are supposed to see. 

###	Attribute Authorities

Explain schema for defining which users can set attributes for a type of entity (i.e. who can set the attribute role of every user in AGILE IDM).

### Attribute Visibility

Define how IDM lets users see attributes depending on permissions (i.e. who can see the “credentials” attribute of a particular instance of an entity, such as sensor with a certain id).

### Groups

Groups are owned by users and the owner can always add or remove entities to the group

