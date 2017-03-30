"""
The latest version of this package is available at:
<http://github.com/jantman/biweeklybudget>

################################################################################
Copyright 2016 Jason Antman <jason@jasonantman.com> <http://www.jasonantman.com>

    This file is part of biweeklybudget, also known as biweeklybudget.

    biweeklybudget is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    biweeklybudget is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with biweeklybudget.  If not, see <http://www.gnu.org/licenses/>.

The Copyright and Authors attributions contained herein may not be removed or
otherwise altered, except to add the Author attribution of a contributor to
this work. (Additional Terms pursuant to Section 7b of the AGPL v3)
################################################################################
While not legally required, I sincerely request that anyone who finds
bugs please submit them at <https://github.com/jantman/biweeklybudget> or
to me via email, and that you send any contributions or improvements
either as a pull request on GitHub, or to me via email.
################################################################################

AUTHORS:
Jason Antman <jason@jasonantman.com> <http://www.jasonantman.com>
################################################################################
"""

import logging
from flask.views import MethodView
from flask import jsonify, request

logger = logging.getLogger(__name__)


class FormHandlerView(MethodView):

    def post(self):
        """
        Handle a POST request for a form. Validate it, if valid update the DB.

        Returns a JSON hash with the following structure:

        'errors' -> hash of field names to list of error strings
        'error_message' -> string error message
        'success' -> boolean
        'success_message' -> string success message
        """
        data = request.form.to_dict()
        res = self.validate(data)
        if res is not None:
            return jsonify({
                'success': False,
                'errors': res
            })
        try:
            res = self.submit(data)
        except Exception as ex:
            return jsonify({
                'success': False,
                'error_message': str(ex)
            })
        return jsonify({
            'success': True,
            'success_message': res
        })

    def validate(self, data):
        """
        Validate the form data. Return None if it is valid, or else a hash of
        field names to list of error strings for each field.

        :param data: submitted form data
        :type data: dict
        :return: None if no errors, or hash of field name to errors for that
          field
        """
        raise NotImplementedError()

    def submit(self, data):
        """
        Handle form submission; create or update models in the DB.

        :param data: submitted form data
        :type data: dict
        :return: message describing changes to DB
        :rtype: str
        """
        raise NotImplementedError()
