function Permission(role, resource, allowed) {
  this.role = role;
  this.resource = resource;
  this.allowed = allowed;
};

function extractRole(role) {
  if (typeof(role) == 'string') {
    return role;
  } else if (typeof(role.role_id) == 'string') {
    return role.role_id;
  } else if (null === role) {
    return null;
  } else {
    throw "Unable to determine role";
  }
};

function extractResource(resource) {
  if (typeof(resource) == 'string') {
    return resource;
  } else if (typeof(resource.resource_id) == 'string') {
    return resource.resource_id;
  } else if (null === resource) {
    return null;
  } else {
    throw "Unable to determine resource";
  }
};

Permission.prototype.match = function(role, resource) {
  var result = null
    , _role = extractRole(role)
    , _resource = extractResource(resource);

  switch (true) {
    case (_role == this.role && _resource == this.resource): // Exact match
    case (this.role == null && this.resource == null): // Global rule
    case (this.role == _role && this.resource == null): // Global rule on role
    case (this.role == null && this.resource == _resource): // Global rule on resource
      return true;
  }

  return false;
}


Permission.prototype.isAllowed = function(role, resource, next, done) {
  switch (typeof(this.allowed)) {
    case 'function':
      this.allowed(null, role, resource, next, done);
      break;

    case 'boolean':
      done(null, this.allowed);
      break;

    default:
      done("Unable to determine permission");
  }
};

module.exports = Permission;