function Permission(role, resource, action, allowed) {
  this.role = role;
  this.resource = resource;
  this.action = action;
  this.allowed = allowed;
};

Permission.prototype.match = function(role, resource, action) {
  var result = null
    , _role = extractRole(role)
    , _resource = extractResource(resource);

  switch (true) {
    case (_role == this.role && _resource == this.resource && action == this.action): // Exact match
    case (this.role == null && this.resource == null && this.action == null): // Global rule
    case (this.role == _role && this.resource == null && this.action == action): // Global rule on role
    case (this.role == null && this.resource == _resource && this.action == action): // Global rule on resource
    case (this.role == _role && this.resource == _resource && this.action == null): // Global rule on action
    case (this.role == null && this.resource == _resource && this.action == null): // Global rule on role and action
    case (this.role == null && this.resource == null && this.action == action): // Global rule on role and resource
    case (this.role == null && this.resource == resource && this.action == null): // Global rule on role and action
    case (this.role == _role && this.resource == null && this.action == null): // Global rule on resource and action
      return true;
  }

  return false;
}

Permission.prototype.query = function(role, resource, action, done, next) {
  switch (typeof(this.allowed)) {
    case 'function':
      this.allowed(null, role, resource, action, done, next);
      break;

    case 'boolean':
      done(null, this.allowed);
      break;

    default:
      done("Unable to determine permission");
  }
};

// Private

function extractRole(role) {
  if (typeof(role) == 'string') {
    return role;
  } else if (null === role) {
    return null;
  } else if (typeof(role.getRoleId) == 'function') {
    return role.getRoleId();
  } else if (typeof(role.role_id) == 'string') {
    return role.role_id;
  } else {
    throw "Unable to determine role";
  }
};

function extractResource(resource) {
  if (typeof(resource) == 'string') {
    return resource;
  } else if (null === resource) {
    return null;
  } else if (typeof(resource.getResourceId) == 'function') {
    return resource.getResourceId();
  } else if (typeof(resource.resource_id) == 'string') {
    return resource.resource_id;
  } else {
    throw "Unable to determine resource";
  }
};

module.exports = Permission;
