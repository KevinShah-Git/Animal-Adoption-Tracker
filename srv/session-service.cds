@path    : '/odata/v4/session'
@requires: 'authenticated-user'
service SessionService {
    type Me {
        id      : String;
        isAdmin : Boolean;
        isUser  : Boolean;
    }

    function me() returns Me;
}
