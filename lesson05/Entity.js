class Entity {
  static load(gl, entityData, initialCoords) {
    switch (entityData.type) {
      case "textured":
        return TexturedEntity.load(gl, entityData, initialCoords);
      case "colored":
        return ColoredEntity.load(gl, entityData, initialCoords);
    }
  }
}