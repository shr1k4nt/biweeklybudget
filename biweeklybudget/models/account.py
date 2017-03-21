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

from sqlalchemy import (
    Column, Integer, String, Boolean, Text, Enum, Numeric, inspect
)
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import relationship

from biweeklybudget.models.base import Base, ModelAsDict
from biweeklybudget.models.account_balance import AccountBalance
from biweeklybudget.utils import dtnow
import json
import enum
from biweeklybudget.settings import STALE_DATA_TIMEDELTA


class AcctType(enum.Enum):
    Bank = 1
    Credit = 2
    Investment = 3
    Cash = 4
    Other = 5


class Account(Base, ModelAsDict):

    __tablename__ = 'accounts'
    __table_args__ = (
        {'mysql_engine': 'InnoDB'}
    )

    # Primary Key
    id = Column(Integer, primary_key=True)

    # name for the account
    name = Column(String(50), unique=True, index=True)

    # description
    description = Column(String(254))

    # whether or not to concatenate the OFX memo text onto the OFX name text;
    # for banks like Chase that use the memo for run-on from the name
    ofx_cat_memo_to_name = Column(Boolean, default=False)

    # path in Vault to read the credentials from
    vault_creds_path = Column(String(254))

    # JSON-encoded ofxgetter configuration
    ofxgetter_config_json = Column(Text)

    # Type of account
    acct_type = Column(Enum(AcctType))

    # credit limit, for credit accounts
    credit_limit = Column(Numeric(precision=10, scale=4))

    # whether or not the account is active and can be used, or historical
    is_active = Column(Boolean, default=True)

    all_statements = relationship(
        'OFXStatement', order_by='OFXStatement.as_of'
    )

    # regexes for matching transactions as various types; case insensitive
    re_interest_charge = Column(
        String(254),
        default='^(interest charge|purchase finance charge)'
    )
    re_interest_paid = Column(
        String(254),
        default='^interest paid'
    )
    re_payment = Column(
        String(254),
        default='^(online payment|internet payment|online pymt|payment)'
    )
    re_fee = Column(
        String(254),
        default='^(late fee|past due fee)'
    )

    def __repr__(self):
        return "<Account(id=%d, name='%s')>" % (
            self.id, self.name
        )

    @hybrid_property
    def for_ofxgetter(self):
        """
        Return whether or not this account should be handled by ofxgetter.

        :return: whether or not ofxgetter should run for this account
        :rtype: bool
        """
        return self.ofxgetter_config_json.isnot(None)

    @hybrid_property
    def is_stale(self):
        """
        Return whether or not there is stale data for this account.

        :return: whether or not data for this account is stale
        :rtype: bool
        """
        # return False if we've never seen OFX data
        if self.ofx_statement is None:
            return False
        return (dtnow() - self.ofx_statement.as_of) > STALE_DATA_TIMEDELTA

    @property
    def ofxgetter_config(self):
        """
        Return the deserialized ofxgetter_config_json dict.

        :return: ofxgetter config
        :rtype: dict
        """
        try:
            return json.loads(self.ofxgetter_config_json)
        except Exception:
            return {}

    def set_ofxgetter_config(self, config):
        """
        Set ofxgetter configuration.

        :param config: ofxgetter configuration
        :type config: dict
        """
        self.ofxgetter_config_json = json.dumps(config)

    def set_balance(self, **kwargs):
        """
        Create an AccountBalance object for this account and associate it with
        the account. Add it to the current session.
        """
        kwargs['account'] = self
        inspect(self).session.add(AccountBalance(**kwargs))

    @property
    def ofx_statement(self):
        """
        Return the latest OFXStatement for this Account.

        :return: latest OFXStatement for this Account
        :rtype: biweeklybudget.models.ofx_statement.OFXStatement
        """
        if len(self.all_statements) < 1:
            return None
        return self.all_statements[-1]

    @property
    def balance(self):
        """
        Return the latest AccountBalance object for this Account.

        :return: latest AccountBalance for this Account
        :rtype: biweeklybudget.models.account_balance.AccountBalance
        """
        sess = inspect(self).session
        res = sess.query(AccountBalance).with_parent(self).order_by(
            AccountBalance.id.desc()).limit(1).first()
        return res