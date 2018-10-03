## Imports
import os, sqlalchemy
import pandas as pd
import numpy as np

from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

## FLASH init
app = Flask(__name__)


## Database (SQLite init)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db/bellybutton.sqlite"
db = SQLAlchemy(app)

Base = automap_base()
Base.prepare(db.engine, reflect=True)

Samples_Metadata = Base.classes.sample_metadata
Samples = Base.classes.samples


@app.route("/")
def get_index():
    """Return the homepage."""
    return render_template("index.html")

@app.route("/delta3")
def get_index_delta3():
    """Return the homepage."""
    return render_template("index-delta3.html")

@app.route("/delta4")
def get_index_delta4():
    """Return the homepage."""
    return render_template("index-delta4.html")


'''
	/names

    @return names
'''
@app.route("/names")
def get_names():
    sql = db.session.query(Samples).statement
    df = pd.read_sql_query(sql, db.session.bind)

    return jsonify(list(df.columns)[2:])


'''
	/metadata/<sample>

    @param sample
    @return metadata
'''
@app.route("/metadata/<sample>")
def get_sample_metadata(sample):

    sel = [
        Samples_Metadata.sample,
        Samples_Metadata.ETHNICITY,
        Samples_Metadata.GENDER,
        Samples_Metadata.AGE,
        Samples_Metadata.LOCATION,
        Samples_Metadata.BBTYPE,
        Samples_Metadata.WFREQ,
    ]

    results = db.session.query(*sel).filter(Samples_Metadata.sample == sample).all()

    metadata = {}
    for result in results:
        metadata["sample"] = result[0]
        metadata["ETHNICITY"] = result[1]
        metadata["GENDER"] = result[2]
        metadata["AGE"] = result[3]
        metadata["LOCATION"] = result[4]
        metadata["BBTYPE"] = result[5]
        metadata["WFREQ"] = result[6]

    return jsonify(metadata)


'''
	/wfreq/<sample>

    @param sample
    @return wfreq
'''
@app.route("/wfreq/<sample>")
def get_sample_metadata_wfreq(sample):
    wfreq = db.session.query(Samples_Metadata.WFREQ).filter(Samples_Metadata.sample==sample).all()
    return jsonify(wfreq[0][0])


'''
	/samples/<sample>

    @param sample
    @return otu_ids, otu_labels, sample_values
'''
@app.route("/samples/<sample>")
def get_samples(sample):
    sql = db.session.query(Samples).statement
    df = pd.read_sql_query(sql, db.session.bind)

    sample_data = df.loc[df[sample] > 1, ["otu_id", "otu_label", sample]]

    data = {
        "otu_ids": sample_data.otu_id.values.tolist(),
        "sample_values": sample_data[sample].values.tolist(),
        "otu_labels": sample_data.otu_label.tolist(),
    }
    return jsonify(data)


## Main functionality
if __name__ == "__main__":
    app.run()
