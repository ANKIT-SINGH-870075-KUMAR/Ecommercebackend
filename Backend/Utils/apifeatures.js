/*
1. query is keywords= laptop(product.findone())
2. querystr is laptop
3. query and querystr is parameter of constructor

*/
class ApiFeatures {
    constructor(query, querystr) {
        this.query = query;
        this.querystr = querystr;
    }

    //search function and return this keyword
    search() {
        const keyword = this.querystr.keyword ? {
            name: {
                /*
                  1.use mongodb operator is regular expersion($regex) and options($options)
                  2. $options: i ---> i use for case insensetive
                */
                $regex: this.querystr.keyword,
                $options: "i",
            }
        } : {};

        this.query = this.query.find({ ...keyword });
        return this;
    }

    // filter function and return this keyword 
    filter() {
        //create copy for querystr
        const queryCopy = { ...this.querystr };

        // Removing some fields for category
        const removeFields = ["keyword", "page", "limit"];

        //removefield is a array and use foreach function
        removeFields.forEach(key => delete queryCopy[key])

        /*
        1.Filter for Price and Rating
        2.convert object into string
        3.use $ for create mongodb operator
        4.gt->greater than, lt->less than, gte->greater than equal to,lte->less than equal to 
        */
        let querystr = JSON.stringify(queryCopy);
        querystr = querystr.replace(/\b(gt|gte|lt|lte)\b/g, key => `$${key}`);

        // convert string into object
        this.query = this.query.find(JSON.parse(querystr));
        return this;
    }

    /*
    1.pagination function and return this keyword
    2.pagination function takes parameter as a resultperpage
    3.quarystr is a string then string convert into number
    4.create logic to skip result for second, third,...and so on
    5.use limit and skip function to control showing the result in one page
    */
    pagination(resultPerPage) {
        const currentPage = Number(this.querystr.page) || 1;
        const skip = resultPerPage * (currentPage - 1);
        this.query = this.query.limit(resultPerPage).skip(skip);
        return this;
    }
}

module.exports = ApiFeatures;