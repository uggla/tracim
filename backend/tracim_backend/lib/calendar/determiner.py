# coding: utf-8
import typing

from tracim_backend.lib.calendar.authorization import DavAuthorization
from tracim_backend.lib.utils.logger import logger

if typing.TYPE_CHECKING:
    from tracim_backend import TracimRequest


class CaldavAuthorizationDeterminer(object):
    def determine_requested_mode(self, request: 'TracimRequest') -> DavAuthorization:
        if request.method in (
            'GET',
            'HEAD',
            'OPTIONS',
            'PROPFIND',
            'LOCK',
            'UNLOCK',
            'REPORT',
        ):
            return DavAuthorization.READ
        elif request.method in (
            'PUT',
            'DELETE',
            'POST',
            'PROPPATCH',
            'COPY',
            'MOVE',
            'MKCOL',
            'MKCALENDAR',
        ):
            return DavAuthorization.WRITE
        else:
            logger.warning(
                self,
                'Unknown http method "{}" authorization will be WRITE'.format(request.method),
            )
            return DavAuthorization.WRITE
