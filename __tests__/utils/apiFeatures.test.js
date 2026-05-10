const APIFeatures = require('../../utils/apiFeatures');

describe('APIFeatures', () => {
  let query;
  let queryString;

  beforeEach(() => {
    query = {
      find: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    };
    queryString = {};
  });

  it('filter: should remove fields like page, sort, limit, fields and apply regex', () => {
    queryString = { page: '1', sort: 'name', limit: '10', fields: 'title', category: 'Tech' };
    new APIFeatures(query, queryString).filter();
    
    expect(query.find).toHaveBeenCalledWith(expect.objectContaining({
      category: { $regex: 'Tech', $options: 'i' }
    }));
    
    const findCallArgs = query.find.mock.calls[0][0];
    expect(findCallArgs).not.toHaveProperty('page');
    expect(findCallArgs).not.toHaveProperty('sort');
  });

  it('sort: should call query.sort with correct parameters', () => {
    queryString = { sort: 'price,name' };
    new APIFeatures(query, queryString).sort();
    expect(query.sort).toHaveBeenCalledWith('price name');
  });

  it('limitFields: should call query.select', () => {
    queryString = { fields: 'name,age' };
    new APIFeatures(query, queryString).limitFields();
    expect(query.select).toHaveBeenCalledWith('name age');
  });

  it('paginate: should call query.skip and query.limit', () => {
    queryString = { page: '2', limit: '10' };
    new APIFeatures(query, queryString).paginate();
    expect(query.skip).toHaveBeenCalledWith(10);
    expect(query.limit).toHaveBeenCalledWith(10);
  });
});
