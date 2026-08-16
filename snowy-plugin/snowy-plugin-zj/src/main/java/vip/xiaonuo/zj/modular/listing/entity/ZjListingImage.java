package vip.xiaonuo.zj.modular.listing.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Getter;
import lombok.Setter;
import vip.xiaonuo.common.pojo.CommonEntity;

@Getter
@Setter
@TableName("ZJ_LISTING_IMAGE")
public class ZjListingImage extends CommonEntity {
    @TableId
    private String id;
    private String listingId;
    private String fileUrl;
    private Integer sortCode;
}
