var PermissionType = require('./permission_type')

var PermissionList = function(permissions, role, resource, action, done) {
  this.permissions = permissions;
  this.role = role;
  this.resource = resource;
  this.action = action;
  this.done = done;
  this.position = 0;
  this.count = this.permissions.length;
};

PermissionList.prototype.next = function() {
  if (this.count == this.position) {
    return this.done(null, false, PermissionType.NONE); // No more permissions to check, DENIED!!, but not because there was a rule to deny
  }

  var permission = this.permissions[this.position];

  // Ensure custom assertions are run async, fixes issue #7
  setTimeout(function() {
    permission.query(
      this.role,
      this.resource,
      this.action,
      this.done,
      this.next.bind(this)
    );
  }.bind(this));

  this.position++;
};

module.exports = PermissionList;
