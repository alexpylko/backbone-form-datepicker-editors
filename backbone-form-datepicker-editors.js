/**
 *
 * Quick form editor to create a bootstrap datepicker
 * @see: https://github.com/eternicode/bootstrap-datepicker/
 * @usage: takes calendar attributes

 schema: {
  YourDateField: {
    type: "Datepicker",
    calendarAttrs: {
    }
  }
}
*/
(function(){
  var DPGlobal = $.fn.datepicker.DPGlobal;

  Backbone.Form.editors.Datepicker = Backbone.Form.editors.Base.extend({

    previousValue: '',

    events: {
      'hide': "hasChanged"
    },

    hasChanged: function(currentValue) {
      if (currentValue !== this.previousValue){
        this.previousValue = currentValue;
        this.trigger('change', this);
      }
    },

    initialize: function(options) {
      Backbone.Form.editors.Base.prototype.initialize.call(this, options);
      this.template = options.template || this.constructor.template;
    },

    commit: function(options) {
      var error = this.validate();
      if (error) return error;

      this.listenTo(this.model, 'invalid', function(model, e) {
        error = e;
      });

      this.model.set(this.key, this.toDBString(this.getValue()), options);

      if (error) return error;
    },

    getCalendarDateFormat: function() {
      var attrs = this.schema.calendarAttrs || {};
      return attrs.format || 'mm/dd/yyyy';
    },

    getDbDateFormat: function() {
      return 'yyyy-mm-dd';
    },

    toHumanString: function(value) {
      var date = DPGlobal.parseDate(value, this.getDbDateFormat());
      return DPGlobal.formatDate(date, this.getCalendarDateFormat(), 'en');
    },

    toDBString: function(value) {
      var date = DPGlobal.parseDate(value, this.getCalendarDateFormat());
      return DPGlobal.formatDate(date, this.getDbDateFormat(), 'en');
    },

    render: function(){
      var schema = this.schema;
      var calendarAttrs = schema.calendarAttrs || {};
      var value = this.toHumanString(this.value || new Date());

      var $el = $($.trim(this.template($.extend({
        value: value,
        dateFormat: this.getCalendarDateFormat()
      }, {}
      ))));

      $el.find('input[type="text"]').datepicker(calendarAttrs);

      this.setElement($el);

      return this;
    }

  }, {
    // STATICS
    template: _.template('\
        <div class="date-calendar">\
        <input type="text" data-date-format="<%= dateFormat %>" value="<%= value %>">\
        </div>\
    ', null, Backbone.Form.templateSettings)
  });
})();