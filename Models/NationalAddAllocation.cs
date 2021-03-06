﻿using Scaffold.Validation;
using App.Utils.Excel;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Http.Validation;

namespace App.Models
{

    [ExcelFileName("ADD Kab Se Indonesia.xlsx")]
    public class NationalAddAllocation : BaseEntity
    {
        [ExcelHeader("No")]
        public string No { get; set; }

        [ExcelHeader("Provinsi/Kabupaten")]
        public string RegionName { get; set; }

        [ExcelHeader("Dana Perimbangan")]
        public decimal? DanaPerimbangan { get; set; }

        [ExcelHeader("Dana Alokasi Khusus")]
        public decimal? Dak { get; set; }

        [ExcelHeader("ADD")]
        public decimal? Add { get; set; }

        [ForeignKey("Region")]
        public String fkRegionId { get; set; }
        public virtual Region Region { get; set; }

        public bool IsActivated { get; set; }

        [ForeignKey("Apbn")]
        public long fkApbnId { get; set; }
        public virtual Apbn Apbn { get; set; }

        [ForeignKey("DocumentUpload")]
        public long fkDocumentUploadId { get; set; }
        public virtual DocumentUpload DocumentUpload { get; set; }
    }
}