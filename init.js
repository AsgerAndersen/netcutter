function init() {

    d3.csv(
        'data/sodas_data_cleaned.csv',
        function (error, input_data) {
            if (error) throw error;
            data = input_data;
            var cutter = new GraphSeqCutter();
            graphseq = cutter.cutGraphSeq(data);
            console.log(graphseq)
        }
    )
}