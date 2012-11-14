var PermissionList = function(permissions, role, resource, action, done) {
  this.permissions = permissions;
  this.role = role;
  this.resource = resource;
  this.action = action;
  this.done = done;
  this.position = 0;
  this.count = this.permissions.length;
}

PermissionList.prototype.next = function() {
  if (this.count == this.position) {
    return this.done(null, false); // No more permissions to check, DENIED!!1
  }

  var permission = this.permissions[this.position];

  permission.isAllowed(
    this.role,
    this.resource,
    this.action,
    function(){this.next();}, // ensure proper scope?
    this.done
  );

  this.position++;
};

module.exports = PermissionList;