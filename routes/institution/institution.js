const institutionRouter = require('express').Router(),
	institution = require('../../middleware/institution/institution');

institutionRouter.post('/', institution.addinstitution);
institutionRouter.get('/', institution.getinstitutions);
institutionRouter.post('/addclass', institution.addclass);
institutionRouter.delete('/', institution.deleteinstitution);
institutionRouter.delete('/class', institution.deleteclass);

module.exports = institutionRouter;
