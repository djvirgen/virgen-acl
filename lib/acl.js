var Permission = require('./permission');
var PermissionList = require('./permission_list');

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

Acl.prototype.allow = function(role, resource, actions, assertion) {
  if (!isArray(actions)) actions = [actions];
  for (var i in actions)
    this.permissions.push(new Permission(role || null, resource || null, actions[i] || null, assertion || true));
};

Acl.prototype.deny = function(role, resource, actions, assertion) {
  if (!isArray(actions)) actions = [actions];
  for (var i in actions)
    this.permissions.push(new Permission(role || null, resource || null, actions[i] || null, assertion || false));
};

Acl.prototype.query = function(role, resource, action, done) {
  // LIFO
  var roles
    , resources
    , matches = [];

  // LIFO loop, starting with specified role/resource and moving up through parents
  roles = getParentRoles.call(this, role);
  resources = getParentResources.call(this, resource);

  for (var i in roles)
    for (var j in resources)
      for (var k = this.permissions.length - 1; k >= 0; k--)
        if (this.permissions[k].match(roles[i] || null, resources[j] || null, action || null)) {
          matches.push(this.permissions[k]);
        }

  var pl = new PermissionList(matches, role, resource, action, done);
  pl.next();
};

// Private

var getParentRole = function(role) {
  return this.roles[role] || null;
};

var getParentRoles = function(role) {
  var roles = [];

  do {
    roles.push(role);
  } while (role = getParentRole.call(this, role));

  return roles;
};

var getParentResources = function(resource) {
  var resources = [resource];

  do {
    resources.push(resource);
  } while (resource = getParentResource.call(this, resource));

  return resources;
};

var getParentResource = function(resource) {
  return this.resources[resource] || null;
};

var isArray = Array.isArray || function (vArg) {
  return Object.prototype.toString.call(vArg) === "[object Array]";
};

module.exports = Acl;
