var Permission = require('./permission');

function Acl() {
  this.permissions = [];
  this.roles = {};
  this.resources = {};
}

Acl.prototype.addRole = function(role, parent) {
  this.roles[role] = parent || null;
};

Acl.prototype.addResource = function(resource, parent) {
  this.resources[resource] = parent || null;
};

Acl.prototype.allow = function(role, resource) {
  this.permissions.push(new Permission(role || null, resource || null, true));
};

Acl.prototype.deny = function(role, resource) {
  this.permissions.push(new Permission(role || null, resource || null, false));
};

Acl.prototype.getParentRole = function(role) {
  return this.roles[role] || null;
}

Acl.prototype.getParentResource = function(resource) {
  return this.resources[resource] || null;
}

Acl.prototype.isAllowed = function(role, resource) {
  // LIFO
  var result = false;

  for (var i = this.permissions.length - 1; i >= 0; i--) {
    result = this.permissions[i].isAllowed(role || null, resource || null);
    if (null != result) break; // Found a match
  }

  // Return if match is found
  if (null !== result) return result;

  // Try parents
  var _role = role;
  var _resource = resource;
  do {
    _resource = resource;
    do {
      for (var i = this.permissions.length - 1; i >= 0; i--) {
        result = this.permissions[i].isAllowed(_role || null, _resource || null);
        if (null != result) return result; // Found a match
      }
    } while (_resource = this.getParentResource(_resource));
  } while (_role = this.getParentRole(_role));

  return false; // default to deny
};

Acl.prototype.isDenied = function(role, resource) {
  return !this.isAllowed(role, resource);
};

module.exports = Acl;