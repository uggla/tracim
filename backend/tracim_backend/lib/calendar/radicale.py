# coding: utf-8
import typing

from pyramid.response import Response
from tracim_backend.lib.calendar.authorization import DavAuthorization
from tracim_backend.lib.calendar.determiner import CaldavAuthorizationDeterminer

from tracim_backend.lib.proxy.proxy import Proxy

from sqlalchemy.orm import Session

from tracim_backend.lib.utils.authorization import check_user_calendar_authorization, \
    can_modify_workspace
from tracim_backend.lib.utils.request import TracimContext
from tracim_backend.models import User


if typing.TYPE_CHECKING:
    from tracim_backend import CFG, TracimRequest, NotAuthenticated


class RadicaleApi(object):
    def __init__(
        self,
        session: Session,
        current_user: typing.Optional[User],
        config: 'CFG',
        proxy: Proxy,
        authorization: CaldavAuthorizationDeterminer,
    ):
        self._user = current_user
        self._session = session
        self._config = config
        self._proxy = proxy
        self._authorization = authorization

    def get_remote_user_calendar_response(self, request: 'TracimRequest') -> Response:
        try:
            # FIXME BS 2018-12-06: @inkhey how to make this in Tracim phylosophy ?
            check_user_calendar_authorization(request, self._user.user_id)
        except NotAuthenticated:
            return Response(
                status=401,
                headerlist=[
                    # TODO BS 2018-12-06: Configurable/traduced message ?
                    ('WWW-Authenticate', 'Basic realm="Tracim credentials"'),
                ]
            )

        return self._proxy.get_response_for_request(
            request,
            '/user/{}.ics'.format(
                str(self._user.user_id),
            ),
            extra_headers={
                # NOTE BS 2018-12-04: Radicale must be configured with "http_x_remote_user" as
                # auth type config value.
                'X-Remote-User': request.current_user.user_id,
            }
        )

    def get_remote_workspace_calendar_response(
        self, request: 'TracimRequest', workspace_id: int,
    ) -> Response:
        if self._authorization.determine_requested_mode(request) == DavAuthorization.WRITE:
            # FIXME BS 2018-12-10: How to get TracimContext here ?
            # can_modify_workspace.check(self._context)
            pass

        return self._proxy.get_response_for_request(
            request,
            '/workspace/{}.ics'.format(
                str(workspace_id),
            ),
            extra_headers={
                # NOTE BS 2018-12-04: Radicale must be configured with "http_x_remote_user" as
                # auth type config value.
                'X-Remote-User': request.current_user.user_id,
            }
        )
