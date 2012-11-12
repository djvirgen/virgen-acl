function Permission(role, resource, allowed) {
  this.role = role;
  this.resource = resource;
  this.allowed = allowed;
};

Permission.prototype.isAllowed = function(role, resource) {
  var result;

  switch (true) {
    case (this.role == null && this.resource == null): // Global rule
    case (this.role == role && this.resource == null): // Global rule on role
    case (this.role == null && this.resource == resource): // Global rule on resource
    case (role == this.role && resource == this.resource): // Exact match
      result = this.allowed;
      break;

    default:
      result = null; // No match
  }

  return result;
};

module.exports = Permission;