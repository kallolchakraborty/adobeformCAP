using {s4hOP.MO.db as db} from '../db/schema';

namespace s4hOP.MO.srv;

/**
 * setting path of the service & the custom handlers url: <https://cap.cloud.sap/docs/node.js/services#srv-impls>
 */

service catalogService @(path : '/CatalogService') @(impl : './custom-handlers.js') {

    /**
     * <https://cap.cloud.sap/docs/guides/providing-services#etag>
     */
    annotate MaintenanceOrder with {
        modifiedAt @odata.etag
    }

    /**
     * control exposure of associations and compositions: hiding of
     * the entities having associations
     */
    entity MaintenanceOrder          as projection on db.MaintenanceOrder excluding {
        maintenanceOrderOperation
    };

    entity MaintenanceOrderOperation as projection on db.MaintenanceOrderOperation;

    /**
     * adding the following lines to create the non-persistent
     * entity
     */
    @readonly  @cds.persistence.skip
    entity PDFdoc {
        key Id      : String(20);
            pdfFile : String
    }
}
