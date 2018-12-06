# coding: utf-8
import marshmallow as marshmallow
from hapic import HapicData
from pyramid.config import Configurator
from pyramid.response import Response
from tracim_backend.extensions import hapic
from tracim_backend.exceptions import NotAuthorized
from tracim_backend.exceptions import NotAuthenticated
from tracim_backend.lib.calendar.radicale import RadicaleApi
from tracim_backend.lib.proxy.proxy import Proxy
from tracim_backend.lib.utils.authorization import check_right, \
    is_user, can_see_workspace_information
from tracim_backend.lib.utils.request import TracimRequest
from tracim_backend.views.controllers import Controller


# FIXME BS 2018-12-06: Move
class UserCalendarPath(marshmallow.Schema):
    user_id = marshmallow.fields.String(required=True)


# FIXME BS 2018-12-06: Move
class WorkspaceCalendarPath(marshmallow.Schema):
    workspace_id = marshmallow.fields.String(required=True)


class RadicaleProxyController(Controller):
    def __init__(self):
        self._proxy = Proxy(
            # FIXME BS 2018-11-27: from config
            base_address='http://127.0.0.1:4321',
        )

    # FIXME BS 2018-11-29: can't make api doc because no method specified
    # We must set all methods if we want doc
    # @hapic.with_api_doc()
    @hapic.handle_exception(NotAuthenticated, http_code=401)
    @hapic.handle_exception(NotAuthorized, http_code=403)
    @check_right(is_user)
    @hapic.input_path(UserCalendarPath)
    def radicale_proxy__user(
        self, context, request: TracimRequest, hapic_data: HapicData,
    ) -> Response:
        radicale_api = RadicaleApi(
            config=request.registry.settings['CFG'],
            current_user=request.current_user,
            session=request.dbsession,
            proxy=self._proxy,
        )

        radicale_response = radicale_api.get_remote_user_calendar_response(
            request,
        )
        return radicale_response

    # FIXME BS 2018-11-29: can't make api doc because no method specified
    # We must set all methods if we want doc
    # @hapic.with_api_doc()
    @hapic.handle_exception(NotAuthenticated, http_code=401)
    @hapic.handle_exception(NotAuthorized, http_code=403)
    @check_right(is_user)
    @check_right(can_see_workspace_information)
    # FIXME BS 2018-12-06: We fail here because previous view have not with_api_doc.
    # So hapic buffer is not clear and input_path raise an error.
    @hapic.input_path(WorkspaceCalendarPath)
    def radicale_proxy__workspace(
        self, context, request: TracimRequest, hapic_data: HapicData,
    ) -> Response:
        workspace_id = int(hapic_data.path['user_id'])
        radicale_api = RadicaleApi(
            config=request.registry.settings['CFG'],
            current_user=request.current_user,
            session=request.dbsession,
            proxy=self._proxy,
        )

        radicale_response = radicale_api.get_remote_workspace_calendar_response(
            request,
            workspace_id=int(workspace_id),
        )
        return radicale_response

    def bind(self, configurator: Configurator) -> None:
        """
        Create all routes and views using pyramid configurator
        for this controller
        """
        # Radicale user calendar
        configurator.add_route(
            'radicale_proxy__user',
            '/radicale/user/{user_id:[0-9]+}.ics',
        )
        configurator.add_view(
            self.radicale_proxy__user,
            route_name='radicale_proxy__user',
        )

        # Radicale workspace calendar
        configurator.add_route(
            'radicale_proxy__workspace',
            '/radicale/workspace/{workspace_id:[0-9]+}.ics',
        )
        configurator.add_view(
            self.radicale_proxy__workspace,
            route_name='radicale_proxy__workspace',
        )
